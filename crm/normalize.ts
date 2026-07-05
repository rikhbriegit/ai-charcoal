// Company/contact normalization for dedup (SPEC §2.1 / §3). name_normalized is
// the primary dedup key; email_domain + phones are the 2nd/3rd. Known-fragile for
// Arabic/Persian transliteration — the merge action (§3.5) is the real safety net.

// Common legal suffixes stripped before matching (Gulf + intl + Indonesian).
const LEGAL = [
  "llc", "l l c", "fze", "fzc", "fzco", "fze llc", "wll", "w l l",
  "ltd", "limited", "co", "company", "corp", "corporation", "inc", "incorporated",
  "gmbh", "pte", "pvt", "plc", "est", "establishment", "trading", "trdg",
  "general trading", "gen trading", "sa", "sarl", "srl", "bv", "nv",
  "sdn bhd", "bhd", "tbk", "pt", "cv", "ug", "ag", "spa",
];
const LEGAL_RE = new RegExp("\\b(" + LEGAL.map((s) => s.replace(/ /g, "\\s+")).join("|") + ")\\b", "gi");

export function normalizeName(raw: string): string {
  return (raw || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.,]/g, " ")          // "l.l.c" → "l l c" so LEGAL_RE can catch it
    .replace(LEGAL_RE, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // drop symbols; keep letters/digits incl. Arabic/Persian
    .replace(/\s+/g, " ")
    .trim();
}

export function emailDomain(email: string): string | null {
  const at = (email || "").trim().toLowerCase().split("@");
  return at.length === 2 && at[1] ? at[1] : null;
}

// Loose E.164-ish normalization: keep a leading "+" and digits only. Returns null
// if there aren't enough digits to be a real number.
export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const plus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return (plus ? "+" : "") + digits;
}
