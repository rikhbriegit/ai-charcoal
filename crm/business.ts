// CRM business queries/commands for the admin screens (§8.4). All callers are
// behind requireAuth. Reads via crm_app; writes respect the append-only ledger
// (shipments log a system interaction into the hash-chain).
import { get, all, run, tx } from "./db";
import { appendInteraction } from "./chain";

const STAGES = new Set(["new", "qualified", "quoted", "sample_sent", "negotiation", "won", "lost", "dormant"]);
const SIZES = new Set(["20ft", "40ft"]);

// ── Inbox: fresh leads (pipeline stage=new) + the unparsed chat queue ────────
export async function listInbox() {
  const leads = await all(
    `SELECT c.id, c.name, c.country, c.status, c.first_touch_at, c.first_touch_channel,
            p.stage,
            (SELECT summary FROM interactions i WHERE i.company_id = c.id ORDER BY i.id DESC LIMIT 1) AS last_summary
       FROM companies c
       JOIN pipeline p ON p.company_id = c.id
      WHERE p.stage = 'new'
      ORDER BY c.first_touch_at DESC
      LIMIT 200`
  );
  const unparsed = await all(
    `SELECT id, reason, extracted, created_at FROM unparsed_leads WHERE resolved = false ORDER BY created_at DESC LIMIT 200`
  );
  return { leads, unparsed };
}

// ── Companies list (optional status filter + name search) ────────────────────
export async function listCompanies(opts: { status?: string; q?: string }) {
  const clauses: string[] = [];
  const params: any[] = [];
  if (opts.status) { clauses.push("status = ?"); params.push(opts.status); }
  if (opts.q) { clauses.push("name_normalized LIKE ?"); params.push("%" + opts.q.toLowerCase() + "%"); }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  return all(
    `SELECT c.id, c.name, c.country, c.status, c.first_touch_at, c.first_touch_channel, p.stage,
            (SELECT count(*) FROM shipments s WHERE s.company_id = c.id) AS shipments,
            (SELECT coalesce(sum(containers),0) FROM shipments s WHERE s.company_id = c.id) AS containers
       FROM companies c LEFT JOIN pipeline p ON p.company_id = c.id
       ${where}
      ORDER BY c.first_touch_at DESC LIMIT 500`,
    params
  );
}

// pg_trgm duplicate suggestions for a company name (§1.5 — suggest, human merges).
export async function suggestDuplicates(name: string, excludeId?: string) {
  return all(
    `SELECT id, name, status, similarity(name_normalized, ?) AS sim
       FROM companies
      WHERE (? = '' OR id <> ?::uuid)
        AND similarity(name_normalized, ?) > 0.35
      ORDER BY sim DESC LIMIT 8`,
    [name.toLowerCase(), excludeId || "", excludeId || "00000000-0000-0000-0000-000000000000", name.toLowerCase()]
  );
}

// ── Commission ledger across all companies (Shipments & Komisi screen) ───────
export async function listLedger() {
  return all(
    `SELECT s.id, s.bl_number, s.bl_date, s.containers, s.container_size, s.order_seq,
            s.destination_country, c.id AS company_id, c.name AS company,
            cl.amount_total, cl.status AS commission_status, cl.invoiced_month, cl.paid_at
       FROM shipments s
       JOIN companies c ON c.id = s.company_id
       LEFT JOIN commission_ledger cl ON cl.shipment_id = s.id
      ORDER BY s.bl_date DESC, s.created_at DESC
      LIMIT 500`
  );
}

// ── Company detail: company + contacts + timeline + shipments + commission ───
export async function getCompanyDetail(id: string) {
  const company = await get("SELECT * FROM companies WHERE id = ?", [id]);
  if (!company) return null;
  const [contacts, interactions, shipments, pipeline] = await Promise.all([
    all("SELECT id, name, role, email, phone_e164, wa_verified, created_at FROM contacts WHERE company_id = ? ORDER BY created_at", [id]),
    all("SELECT id, happened_at, channel, direction, kind, summary, payload, created_at, row_hash FROM interactions WHERE company_id = ? ORDER BY id DESC", [id]),
    all(
      `SELECT s.*, cl.amount_per_container, cl.amount_total, cl.status AS commission_status, cl.invoiced_month, cl.paid_at
         FROM shipments s LEFT JOIN commission_ledger cl ON cl.shipment_id = s.id
        WHERE s.company_id = ? ORDER BY s.bl_date DESC`, [id]
    ),
    get("SELECT stage, stage_changed_at, expected_containers, notes FROM pipeline WHERE company_id = ?", [id]),
  ]);
  return { company, contacts, interactions, shipments, pipeline };
}

// ── Pipeline stage change (mutable) ──────────────────────────────────────────
export async function setStage(companyId: string, stage: string, notes?: string) {
  if (!STAGES.has(stage)) throw new Error("stage tidak valid");
  const r = await run(
    "UPDATE pipeline SET stage = ?, stage_changed_at = now(), notes = COALESCE(?, notes) WHERE company_id = ?",
    [stage, notes ?? null, companyId]
  );
  if (r.changes === 0) throw new Error("company tidak ditemukan");
  return { ok: true };
}

// "Spam" from the Inbox: can't delete (interactions are append-only) → mark lost.
export async function markSpam(companyId: string) {
  return setStage(companyId, "lost", "marked spam from inbox");
}

// ── Create a shipment (Kontainer Terkirim) → accrue commission (§2.5/§2.6) ───
export interface ShipmentInput {
  company_id: string;
  bl_number: string;
  bl_date: string;         // YYYY-MM-DD
  containers: number;
  container_size: string;  // 20ft | 40ft
  destination_country?: string;
  source_report_month?: string;
}

export async function createShipment(input: ShipmentInput) {
  const containers = Math.floor(Number(input.containers));
  if (!input.company_id) throw new Error("company_id wajib");
  if (!input.bl_number || !input.bl_number.trim()) throw new Error("bl_number wajib");
  if (!input.bl_date || !/^\d{4}-\d{2}-\d{2}$/.test(input.bl_date)) throw new Error("bl_date harus YYYY-MM-DD");
  if (!Number.isFinite(containers) || containers <= 0) throw new Error("containers harus > 0");
  if (!SIZES.has(input.container_size)) throw new Error("container_size harus 20ft/40ft");

  return tx(async (d) => {
    const company = await d.get("SELECT id, name, status FROM companies WHERE id = ?", [input.company_id]);
    if (!company) throw new Error("company tidak ditemukan");

    const dup = await d.get("SELECT id FROM shipments WHERE bl_number = ?", [input.bl_number.trim()]);
    if (dup) throw new Error("bl_number sudah ada (duplikat B/L)");

    const seqRow = await d.get("SELECT count(*)::int AS n FROM shipments WHERE company_id = ?", [input.company_id]);
    const orderSeq = (seqRow?.n ?? 0) + 1;

    const shipment = await d.get(
      `INSERT INTO shipments (company_id, bl_number, bl_date, containers, container_size, destination_country, order_seq, source_report_month)
       VALUES (?,?,?,?,?,?,?,?) RETURNING *`,
      [input.company_id, input.bl_number.trim(), input.bl_date, containers, input.container_size,
       input.destination_country || null, orderSeq, input.source_report_month || null]
    );

    // Snapshot the commission rate at creation time (SPEC §2.6).
    const rateRow = await d.get("SELECT value FROM settings WHERE key = 'commission_per_container'");
    const rate = Number(rateRow?.value || 0);
    const total = rate * containers;
    await d.run(
      "INSERT INTO commission_ledger (shipment_id, amount_per_container, amount_total, status) VALUES (?,?,?,'accrued')",
      [shipment.id, rate, total]
    );

    // First B/L promotes Lead → Customer Digital (SPEC §2.1).
    if (orderSeq === 1) {
      await d.run("UPDATE companies SET status = 'customer_digital', became_customer_at = now() WHERE id = ?", [input.company_id]);
      await d.run("UPDATE pipeline SET stage = 'won', stage_changed_at = now() WHERE company_id = ?", [input.company_id]);
    }

    // Log the B/L into the hash-chain as a system interaction (evidence trail).
    await appendInteraction(d, {
      company_id: input.company_id,
      channel: "other",
      direction: "inbound",
      kind: "system",
      summary: `B/L ${input.bl_number.trim()} — ${containers}× ${input.container_size}${orderSeq >= 2 ? " (Repeat Order)" : ""} → ${input.destination_country || "-"}`,
      payload: { shipment_id: shipment.id, bl_number: input.bl_number.trim(), bl_date: input.bl_date, containers, order_seq: orderSeq, amount_total: total },
    });

    return { shipment_id: shipment.id, order_seq: orderSeq, repeat_order: orderSeq >= 2, amount_total: total };
  });
}
