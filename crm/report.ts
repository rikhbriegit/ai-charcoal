// §8.5 — dashboard metrics, monthly commission report (§6), and reconciliation (§5).
import { get, all, run } from "./db";
import { verifyChain } from "./chain";

// ── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard() {
  const [byChannel, byStage, byStatus, totals, byCommission, trend] = await Promise.all([
    all("SELECT first_touch_channel AS k, count(*)::int AS n FROM companies GROUP BY 1 ORDER BY 2 DESC"),
    all("SELECT stage AS k, count(*)::int AS n FROM pipeline GROUP BY 1"),
    all("SELECT status AS k, count(*)::int AS n FROM companies GROUP BY 1"),
    get("SELECT coalesce(sum(containers),0)::int AS containers, count(*)::int AS shipments FROM shipments"),
    all("SELECT status AS k, coalesce(sum(amount_total),0)::bigint AS amt FROM commission_ledger GROUP BY 1"),
    all(
      `SELECT to_char(s.bl_date,'YYYY-MM') AS month,
              count(*)::int AS shipments,
              coalesce(sum(s.containers),0)::int AS containers,
              coalesce(sum(cl.amount_total),0)::bigint AS commission
         FROM shipments s LEFT JOIN commission_ledger cl ON cl.shipment_id = s.id
        GROUP BY 1 ORDER BY 1 DESC LIMIT 6`
    ),
  ]);
  const commission: Record<string, number> = { accrued: 0, invoiced: 0, paid: 0, disputed: 0 };
  for (const r of byCommission as any[]) commission[r.k] = Number(r.amt);
  return {
    leadsByChannel: byChannel,
    pipelineByStage: byStage,
    companiesByStatus: byStatus,
    totals: { containers: totals?.containers ?? 0, shipments: totals?.shipments ?? 0 },
    commission,
    trend: (trend as any[]).reverse(), // oldest → newest for charting
  };
}

// ── Monthly report (§6) ──────────────────────────────────────────────────────
export interface ReportRow {
  company_id: string; company: string; first_touch_at: string; first_touch_channel: string;
  bl_number: string; bl_date: string; containers: number; container_size: string;
  order_seq: number; amount_total: string; commission_status: string;
}

export async function getMonthlyReport(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("month harus YYYY-MM");
  const rows = (await all(
    `SELECT c.id AS company_id, c.name AS company, c.first_touch_at, c.first_touch_channel,
            s.bl_number, s.bl_date, s.containers, s.container_size, s.order_seq,
            cl.amount_total, cl.status AS commission_status
       FROM shipments s
       JOIN companies c ON c.id = s.company_id
       LEFT JOIN commission_ledger cl ON cl.shipment_id = s.id
      WHERE to_char(s.bl_date,'YYYY-MM') = ?
      ORDER BY c.name, s.bl_date`,
    [month]
  )) as ReportRow[];

  const totals = rows.reduce(
    (a, r) => ({ containers: a.containers + Number(r.containers), commission: a.commission + Number(r.amount_total || 0) }),
    { containers: 0, commission: 0 }
  );
  const customers = new Set(rows.map((r) => r.company_id)).size;
  const chain = await verifyChain(all);
  return { month, rows, totals, customers, chain };
}

function csvCell(v: any): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export async function getMonthlyReportCsv(month: string): Promise<string> {
  const { rows, totals, chain } = await getMonthlyReport(month);
  const header = ["Company", "First Touch", "Channel", "B/L Number", "B/L Date", "Containers", "Size", "Order Seq", "Commission (Rp)", "Status"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      r.company, new Date(r.first_touch_at).toISOString().slice(0, 10), r.first_touch_channel,
      r.bl_number, r.bl_date, r.containers, r.container_size, r.order_seq, r.amount_total || 0, r.commission_status || "",
    ].map(csvCell).join(","));
  }
  lines.push("");
  lines.push(["TOTAL", "", "", "", "", totals.containers, "", "", totals.commission, ""].map(csvCell).join(","));
  lines.push([`Chain verified: ${chain.ok}`, `rows: ${chain.count}`].map(csvCell).join(","));
  return lines.join("\n");
}

// ── Reconciliation (§5) ──────────────────────────────────────────────────────
export interface TheirRow { bl_number?: string; company?: string; containers?: any; }

export async function reconcile(month: string, theirRows: TheirRow[]) {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("month harus YYYY-MM");
  const ours = (await all(
    `SELECT s.bl_number, s.containers, c.name AS company
       FROM shipments s JOIN companies c ON c.id = s.company_id
      WHERE to_char(s.bl_date,'YYYY-MM') = ?`,
    [month]
  )) as any[];

  const norm = (b: any) => String(b || "").trim().toUpperCase();
  const ourBL = new Map(ours.map((r) => [norm(r.bl_number), r]));
  const theirBL = new Map(
    theirRows.filter((r) => r.bl_number).map((r) => [norm(r.bl_number), r])
  );

  const matched: string[] = [];
  const unmatchedOurs: any[] = []; // in CRM, absent from their report → possible UNPAID commission
  for (const [bl, r] of ourBL) {
    if (theirBL.has(bl)) matched.push(bl);
    else unmatchedOurs.push({ bl_number: r.bl_number, company: r.company, containers: r.containers });
  }
  const unmatchedTheirs: any[] = []; // in their report, not a Customer Digital B/L → normal / to check
  for (const [bl, r] of theirBL) {
    if (!ourBL.has(bl)) unmatchedTheirs.push({ bl_number: r.bl_number, company: r.company ?? null });
  }

  await run(
    `INSERT INTO reconciliations (month, imported_rows, matched, unmatched_ours, unmatched_theirs, resolved, notes)
     VALUES (?, ?::jsonb, ?, ?, ?, false, ?)`,
    [month, JSON.stringify(theirRows.slice(0, 2000)), matched.length, unmatchedOurs.length, unmatchedTheirs.length, null]
  );

  return {
    month,
    matched: matched.length,
    unmatched_ours: unmatchedOurs,     // the money-at-risk list
    unmatched_theirs: unmatchedTheirs,
    our_total: ours.length,
    their_total: theirBL.size,
  };
}

export async function listReconciliations() {
  return all("SELECT id, month, matched, unmatched_ours, unmatched_theirs, resolved, created_at FROM reconciliations ORDER BY created_at DESC LIMIT 50");
}
