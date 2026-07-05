// AI-chat lead extraction (SPEC §4). A SEPARATE model pass over the transcript —
// NOT the sales persona — forced to return strict JSON. Runs when a conversation
// ends. Failure (model down / unparseable) is handled by the caller (→ unparsed queue).
import { chatCompletion, type ChatMessage } from "../lib/ollama";

export interface ExtractedLead {
  is_lead: boolean;
  company: string | null;
  contact_name: string | null;
  country: string | null;
  product: string | null;
  quantity: string | null;
  destination_port: string | null;
  phone: string | null;
  email: string | null;
  confidence: number; // 0..1
}

const SYS = `You extract B2B sales-lead data from a customer chat transcript for a coconut-charcoal exporter.
Return ONLY one minified JSON object — no prose, no markdown code fences. Exact schema:
{"is_lead":boolean,"company":string|null,"contact_name":string|null,"country":string|null,"product":string|null,"quantity":string|null,"destination_port":string|null,"phone":string|null,"email":string|null,"confidence":number}
Rules:
- is_lead=true ONLY if the customer shows genuine buying intent (wants to order, asks for a quote/sample, states volumes or a destination). Casual/browsing/greeting-only chat → is_lead=false.
- country: 2-letter ISO code if inferable (e.g. "SA","AE","IR","IQ","TR","BH") else null.
- Use null for anything not explicitly stated. NEVER invent values.
- confidence: 0..1 — how confident this is a real, contactable lead.`;

const s = (v: any): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function extractLeadFromTranscript(
  history: { role: string; text: string }[]
): Promise<ExtractedLead | null> {
  const convo = history
    .filter((h) => h && typeof h.text === "string" && h.text.trim())
    .map((h) => `${h.role === "user" ? "CUSTOMER" : "ASSISTANT"}: ${h.text.trim()}`)
    .join("\n")
    .slice(0, 8000);
  if (!convo) return null;

  const messages: ChatMessage[] = [
    { role: "system", content: SYS },
    { role: "user", content: "TRANSCRIPT:\n" + convo + "\n\nJSON:" },
  ];

  let raw: string;
  try {
    raw = await chatCompletion(messages, { temperature: 0.1, max_tokens: 400 });
  } catch {
    return null; // model unreachable → caller queues to unparsed
  }

  const m = raw.match(/\{[\s\S]*\}/); // first JSON-looking block (tolerates stray prose/fences)
  if (!m) return null;
  let o: any;
  try {
    o = JSON.parse(m[0]);
  } catch {
    return null;
  }

  const country = s(o.country);
  return {
    is_lead: !!o.is_lead,
    company: s(o.company),
    contact_name: s(o.contact_name),
    country: country ? country.slice(0, 40) : null,
    product: s(o.product),
    quantity: s(o.quantity),
    destination_port: s(o.destination_port),
    phone: s(o.phone),
    email: s(o.email),
    confidence: typeof o.confidence === "number" ? Math.max(0, Math.min(1, o.confidence)) : 0,
  };
}
