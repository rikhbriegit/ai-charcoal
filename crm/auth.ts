// CRM auth — ported & simplified from orbit-ai-chat-embedded (lib/auth.ts) for a
// single-user internal ledger:
//  - Google OAuth via GIS ID-token verified server-side (verifyIdToken).
//  - bcrypt password fallback (no single point of failure on Google).
//  - JWT in an httpOnly cookie; revocation via accounts.token_version.
//  - STRICT email allowlist (unlike orbit's open self-signup).
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import type { Request, Response, NextFunction } from "express";
import { get, run } from "./db";

const COOKIE = "crm_session";
const googleClient = new OAuth2Client();

// No insecure fallback: a missing/weak secret lets anyone forge sessions.
const secret = (): string => {
  const s = process.env.CRM_JWT_SECRET;
  if (!s || s.length < 16) throw new Error("CRM_JWT_SECRET belum di-set (atau < 16 karakter).");
  return s;
};
/** Call at startup so the process fails fast if CRM auth is misconfigured. */
export function assertCrmAuthConfigured(): void {
  secret();
}

// Only these Google/login emails may authenticate (SPEC §0.1). Empty = nobody.
export function allowlist(): string[] {
  return (process.env.CRM_AUTH_ALLOWLIST || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
export function isAllowed(email: string): boolean {
  return allowlist().includes(email.trim().toLowerCase());
}

export interface Session {
  email: string;
  v: number; // token version — must match accounts.token_version
}

export const hashPassword = (pw: string): Promise<string> => bcrypt.hash(pw, 12); // cost 12 (SPEC §0.2)
export const verifyPassword = (pw: string, hash: string): Promise<boolean> => bcrypt.compare(pw, hash);

export function issueSession(res: Response, s: Session): void {
  const token = jwt.sign(s, secret(), { expiresIn: "24h" }); // ≤24h, no refresh (SPEC §0.3)
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.CRM_INSECURE_COOKIES !== "1",
    maxAge: 24 * 60 * 60 * 1000,
  });
}
export function clearSession(res: Response): void {
  res.clearCookie(COOKIE);
}

async function accountVersion(email: string): Promise<number | null> {
  const r = await get<{ token_version: number }>("SELECT token_version FROM accounts WHERE email = ?", [email]);
  return r ? r.token_version : null;
}

/** Upsert the account row on successful login; returns its current token_version. */
export async function ensureAccount(email: string, name: string | null, provider: string): Promise<number> {
  const existing = await get<{ token_version: number }>("SELECT token_version FROM accounts WHERE email = ?", [email]);
  if (existing) {
    await run("UPDATE accounts SET last_login_at = now(), auth_provider = ? WHERE email = ?", [provider, email]);
    return existing.token_version;
  }
  await run("INSERT INTO accounts (email, name, auth_provider, last_login_at) VALUES (?, ?, ?, now())", [email, name, provider]);
  return 0;
}
/** Invalidate all issued sessions for an email (logout / compromise). */
export async function revoke(email: string): Promise<void> {
  await run("UPDATE accounts SET token_version = token_version + 1 WHERE email = ?", [email]);
}

export async function readSession(req: Request): Promise<Session | null> {
  const token = (req as any).cookies?.[COOKIE];
  if (!token) return null;
  try {
    const s = jwt.verify(token, secret()) as Session;
    if ((await accountVersion(s.email)) !== s.v) return null; // revoked/rotated
    return s;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: Request & { crmSession?: Session },
  res: Response,
  next: NextFunction
): Promise<void> {
  const s = await readSession(req);
  if (!s) {
    res.status(401).json({ error: "Belum login." });
    return;
  }
  req.crmSession = s;
  next();
}

/** Verify a GIS ID token; returns the verified email/name or null. Does NOT check the allowlist. */
export async function verifyGoogle(credential: string): Promise<{ email: string; name: string } | null> {
  const CID = process.env.CRM_GOOGLE_CLIENT_ID;
  if (!CID) return null;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: CID });
    const p = ticket.getPayload();
    if (!p?.email || !p.email_verified) return null;
    return { email: p.email.trim(), name: (p.name || p.given_name || p.email.split("@")[0]).slice(0, 60) };
  } catch {
    return null;
  }
}
