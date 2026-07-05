// Routes an ended AI-chat conversation to the ledger (SPEC §4):
//   extraction ok + buyer intent + identity + confidence ≥ 0.5 → intakeLead (ai_chat)
//   buyer intent but weak/no identity, or extraction failed          → unparsed queue
//   no buyer intent (casual chat)                                    → dropped
import { extractLeadFromTranscript } from "./extract";
import { intakeLead } from "./leads";
import { run } from "./db";

const CONFIDENCE_MIN = 0.5;

export interface ChatTurn { role: string; text: string; }

export async function intakeChatLead(
  history: ChatTurn[],
  conversationId: string | null
): Promise<{ outcome: "lead" | "unparsed" | "not_a_lead" }> {
  const transcript = history.slice(0, 100);
  const ex = await extractLeadFromTranscript(history);

  // Extraction failed (model down / unparseable) but a real conversation happened → queue.
  if (!ex) {
    await run("INSERT INTO unparsed_leads (transcript, reason) VALUES (?::jsonb, ?)", [
      JSON.stringify({ conversationId, history: transcript }),
      "extraction_failed",
    ]);
    return { outcome: "unparsed" };
  }

  if (!ex.is_lead) return { outcome: "not_a_lead" }; // casual chat → drop, no junk lead

  const hasIdentity = !!(ex.company || ex.contact_name || ex.email || ex.phone);
  if (hasIdentity && ex.confidence >= CONFIDENCE_MIN) {
    await intakeLead({
      company: ex.company || undefined,
      contact_name: ex.contact_name || undefined,
      email: ex.email || undefined,
      phone: ex.phone || undefined,
      country: ex.country && ex.country.length === 2 ? ex.country : undefined,
      product: ex.product || undefined,
      quantity: ex.quantity || undefined,
      destination_port: ex.destination_port || undefined,
      channel: "ai_chat",
      first_touch_ref: conversationId || undefined,
      payload_extra: { transcript, extracted: ex },
    });
    return { outcome: "lead" };
  }

  // Buyer intent detected but not confidently contactable → human review.
  await run("INSERT INTO unparsed_leads (transcript, reason, extracted) VALUES (?::jsonb, ?, ?::jsonb)", [
    JSON.stringify({ conversationId, history: transcript }),
    "low_confidence_or_no_identity",
    JSON.stringify(ex),
  ]);
  return { outcome: "unparsed" };
}
