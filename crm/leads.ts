// Lead intake + attribution (SPEC §3). Dedup by name_normalized → email_domain →
// phones; first-touch is set once and never changed. Every lead — even for an
// excluded company — appends an interaction to the hash-chain ledger.
import { tx } from "./db";
import { normalizeName, emailDomain, normalizePhone } from "./normalize";
import { appendInteraction } from "./chain";

const CHANNELS = new Set([
  "web_form", "ai_chat", "whatsapp", "email", "ads_google", "ads_meta",
  "marketplace_b2b", "outreach", "other",
]);

export interface LeadInput {
  company?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  country?: string;      // ISO-2
  city?: string;
  product?: string;
  quantity?: string;
  destination_port?: string;
  channel?: string;
  message?: string;
  first_touch_ref?: string; // UTM string / conversation id / WA msg id
  payload_extra?: any;
}

export interface LeadResult {
  company_id: string;
  created: boolean;        // true = a new Lead Digital was born
  status: string;
  excluded_hit: boolean;   // hit an excluded (Lampiran A) company
  interaction_id: number;
}

function buildSummary(input: LeadInput, channel: string, excluded: boolean): string {
  const bits: string[] = [];
  if (input.product) bits.push(input.product);
  if (input.quantity) bits.push("x " + input.quantity);
  if (input.destination_port) bits.push("→ " + input.destination_port);
  const detail = bits.join(" ") || (input.message ? input.message.slice(0, 80) : "-");
  return `Lead via ${channel}${excluded ? " (EXCLUDED)" : ""}: ${detail}`;
}

export async function intakeLead(input: LeadInput): Promise<LeadResult> {
  const channel = CHANNELS.has(input.channel || "") ? (input.channel as string) : "other";
  const rawName = (input.company || "").trim();
  const contactName = (input.contact_name || "").trim();
  const email = (input.email || "").trim();
  const phone = normalizePhone(input.phone || "");

  const displayName =
    rawName || contactName || (email ? email.split("@")[0] : "") || phone || "Unknown";
  const normalized = normalizeName(displayName);
  const domain = emailDomain(email);
  const phones = phone ? [phone] : [];

  return tx(async (d) => {
    // ── Dedup: name_normalized → email_domain → phones ───────────────────────
    let company = await d.get("SELECT * FROM companies WHERE name_normalized = ?", [normalized]);
    if (!company && domain) company = await d.get("SELECT * FROM companies WHERE email_domain = ?", [domain]);
    if (!company && phones.length) company = await d.get("SELECT * FROM companies WHERE phones @> ?::jsonb", [JSON.stringify(phones)]);

    let created = false;
    if (!company) {
      company = await d.get(
        `INSERT INTO companies
           (name, name_normalized, country, city, email_domain, phones, status, first_touch_at, first_touch_channel, first_touch_ref)
         VALUES (?,?,?,?,?,?::jsonb,'lead', now(), ?, ?)
         RETURNING *`,
        [displayName, normalized, input.country || null, input.city || null, domain, JSON.stringify(phones), channel, input.first_touch_ref || null]
      );
      await d.run("INSERT INTO pipeline (company_id, stage) VALUES (?, 'new') ON CONFLICT (company_id) DO NOTHING", [company.id]);
      created = true;
    }
    const excluded = company.status === "excluded";

    // ── Contact upsert (avoid dupes by email/phone within the company) ───────
    if (contactName || email || phone) {
      const exists = await d.get(
        `SELECT id FROM contacts WHERE company_id = ?
           AND ((? <> '' AND email = ?) OR (? <> '' AND phone_e164 = ?)) LIMIT 1`,
        [company.id, email, email || null, phone || "", phone || null]
      );
      if (!exists) {
        await d.run(
          "INSERT INTO contacts (company_id, name, email, phone_e164) VALUES (?,?,?,?)",
          [company.id, contactName || null, email || null, phone || null]
        );
      }
    }

    // ── Append the ledger interaction (hash-chained) ─────────────────────────
    const it = await appendInteraction(d, {
      company_id: company.id,
      channel,
      direction: "inbound",
      kind: "message",
      summary: buildSummary(input, channel, excluded),
      payload: {
        source: channel,
        created_company: created,
        excluded_hit: excluded,
        form: {
          company: rawName, contact_name: contactName, email, phone,
          country: input.country || null, city: input.city || null,
          product: input.product || null, quantity: input.quantity || null,
          destination_port: input.destination_port || null,
        },
        message: input.message || null,
        utm: input.first_touch_ref || null,
        extra: input.payload_extra || null,
      },
    });

    return { company_id: company.id, created, status: company.status, excluded_hit: excluded, interaction_id: it.id };
  });
}
