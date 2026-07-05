// CRM API router, mounted at /crm/api. Everything except the (future) public
// /leads intake requires a valid session. Auth routes here; business routes added
// in later phases (§8.2+).
import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import {
  issueSession, clearSession, requireAuth, readSession,
  isAllowed, verifyPassword, verifyGoogle, ensureAccount, revoke,
} from "./auth";
import { intakeLead } from "./leads";
import { intakeChatLead } from "./chatlead";
import { verifyChain } from "./chain";
import { all } from "./db";

// Brute-force throttle on the auth endpoints (IP-based, 20 / 15 min). Hand-rolled
// in-memory limiter to match the marketing server's house style (no new dep).
const authHits = new Map<string, { count: number; reset: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of authHits) if (now > v.reset) authHits.delete(k);
}, 300_000).unref();
function authLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  let e = authHits.get(ip);
  if (!e || now > e.reset) { e = { count: 0, reset: now + 15 * 60_000 }; authHits.set(ip, e); }
  if (++e.count > 20) { res.status(429).json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }); return; }
  next();
}

// Public lead intake throttle (10 / min / IP) — blunts spam floods.
const leadsHits = new Map<string, { count: number; reset: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of leadsHits) if (now > v.reset) leadsHits.delete(k);
}, 300_000).unref();
function leadsLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  let e = leadsHits.get(ip);
  if (!e || now > e.reset) { e = { count: 0, reset: now + 60_000 }; leadsHits.set(ip, e); }
  if (++e.count > 10) { res.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi sebentar." }); return; }
  next();
}

// Per-account lockout on the password path: 5 fails → 15 min (SPEC §0.2).
const LOCK_MS = 15 * 60_000, MAX_FAIL = 5;
const fails = new Map<string, { n: number; until: number }>();
const isLocked = (email: string): boolean => {
  const f = fails.get(email);
  return !!(f && f.until > Date.now());
};
const recordFail = (email: string): void => {
  const f = fails.get(email) || { n: 0, until: 0 };
  f.n++;
  if (f.n >= MAX_FAIL) f.until = Date.now() + LOCK_MS;
  fails.set(email, f);
};
const clearFail = (email: string): void => { fails.delete(email); };

export function crmRouter(): Router {
  const r = Router();

  // ── Password fallback login ────────────────────────────────────────────────
  r.post("/auth/login", authLimiter, async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ error: "Email & password wajib." });
    if (!isAllowed(email)) return res.status(403).json({ error: "Email tidak diizinkan." });
    if (isLocked(email)) return res.status(429).json({ error: "Akun terkunci sementara. Coba lagi nanti." });

    const hash = process.env.CRM_FALLBACK_PW_HASH || "";
    const ok = hash ? await verifyPassword(password, hash) : false;
    if (!ok) {
      recordFail(email);
      return res.status(401).json({ error: "Email atau password salah." });
    }
    clearFail(email);
    const v = await ensureAccount(email, null, "password");
    issueSession(res, { email, v });
    res.json({ ok: true, email });
  });

  // ── Google OAuth (GIS ID-token) ────────────────────────────────────────────
  r.post("/auth/google", authLimiter, async (req, res) => {
    const credential = String(req.body?.credential || "");
    if (!credential) return res.status(400).json({ error: "Token Google tidak ada." });
    const g = await verifyGoogle(credential);
    if (!g) return res.status(401).json({ error: "Token Google tidak valid / login Google belum dikonfigurasi." });
    if (!isAllowed(g.email)) return res.status(403).json({ error: "Email tidak diizinkan." });
    const v = await ensureAccount(g.email, g.name, "google");
    issueSession(res, { email: g.email, v });
    res.json({ ok: true, email: g.email });
  });

  r.post("/auth/logout", async (req, res) => {
    const s = await readSession(req);
    if (s) await revoke(s.email);
    clearSession(res);
    res.json({ ok: true });
  });

  r.get("/auth/me", requireAuth, (req: any, res) => {
    res.json({ email: req.crmSession.email });
  });

  // ── Public lead intake (SPEC §4) — the ONLY unauthenticated CRM route. ─────
  // Filled by website visitors, so no auth; guarded by honeypot + IP throttle +
  // strict server-side validation. Channel is forced to web_form (never trust the
  // client to claim a paid channel); the AI-chat path calls intakeLead() directly.
  r.post("/leads", leadsLimiter, async (req, res) => {
    try {
      const b = req.body || {};
      if (b._hp) return res.json({ ok: true }); // honeypot filled by a bot → silently drop
      const clip = (s: any, n: number): string | undefined =>
        typeof s === "string" && s.trim() ? s.trim().slice(0, n) : undefined;

      const hasIdentity = [b.company, b.contact_name, b.email, b.phone].some(
        (x) => typeof x === "string" && x.trim()
      );
      if (!hasIdentity) return res.status(400).json({ error: "Minimal satu: nama perusahaan / nama / email / telepon." });

      const country = clip(b.country, 2);
      await intakeLead({
        company: clip(b.company, 200),
        contact_name: clip(b.contact_name, 120),
        email: clip(b.email, 160),
        phone: clip(b.phone, 40),
        country: country ? country.toUpperCase() : undefined,
        city: clip(b.city, 120),
        product: clip(b.product, 120),
        quantity: clip(b.quantity, 60),
        destination_port: clip(b.destination_port, 120),
        message: clip(b.message, 4000),
        first_touch_ref: clip(b.utm, 600),
        channel: "web_form", // forced — do not trust client-supplied channel
      });
      // Never leak internal ids/dedup outcome to the public caller.
      res.json({ ok: true });
    } catch (e: any) {
      console.error("CRM lead intake error:", e?.message || e);
      res.status(500).json({ error: "Gagal menyimpan lead. Coba lagi." });
    }
  });

  // ── AI-chat lead intake (SPEC §4). Public; called by the chat widget when a
  // conversation ends. Runs a separate extraction pass server-side, then routes
  // to the ledger or the unparsed queue. Rate-limited (it calls the LLM). ──────
  r.post("/chat-lead", leadsLimiter, async (req, res) => {
    try {
      const h = req.body?.history;
      if (!Array.isArray(h) || h.length === 0) return res.status(400).json({ error: "history kosong." });
      const hist = h
        .slice(0, 100)
        .map((m: any) => ({
          role: m?.role === "user" ? "user" : "assistant",
          text: typeof m?.text === "string" ? m.text.slice(0, 4000) : "",
        }))
        .filter((m: any) => m.text);
      if (!hist.some((m: any) => m.role === "user")) return res.json({ ok: true, outcome: "no_user_message" });
      const conversationId = typeof req.body?.conversationId === "string" ? req.body.conversationId.slice(0, 80) : null;
      const out = await intakeChatLead(hist, conversationId);
      res.json({ ok: true, ...out });
    } catch (e: any) {
      console.error("CRM chat-lead error:", e?.message || e);
      res.status(500).json({ error: "Gagal memproses percakapan." });
    }
  });

  // ── Ledger chain integrity (SPEC §2.3) — re-runs the hash-chain from genesis.
  r.get("/chain/verify", requireAuth, async (_req, res) => {
    try {
      res.json(await verifyChain(all));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "verify failed" });
    }
  });

  // ── Protected smoke-test route (placeholder until §8.4 business APIs) ───────
  r.get("/ping", requireAuth, (_req, res) => {
    res.json({ ok: true });
  });

  return r;
}
