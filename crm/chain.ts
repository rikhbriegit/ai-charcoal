// Hash-chain for the append-only `interactions` ledger (SPEC §2.3). Each row's
// row_hash = sha256(prev_hash ‖ canonical_json(fields)). Computed in the app,
// inside the caller's transaction. A transaction-scoped advisory lock serializes
// appenders so two concurrent inserts can't fork the chain (handles the empty-table
// race that FOR UPDATE can't). Timestamps are ISO (ms precision) so the chain is
// reproducible on verify: Postgres timestamptz round-trips back to the same ISO.
import crypto from "crypto";

export const GENESIS = "0".repeat(64);
const CHAIN_LOCK_KEY = 918273645; // arbitrary constant key for pg_advisory_xact_lock

// Deterministic serialization: object keys sorted recursively so jsonb reordering
// on storage never changes the hash.
export function canonicalize(v: any): string {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return "[" + v.map(canonicalize).join(",") + "]";
  if (typeof v === "object") {
    return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonicalize(v[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}

export interface ChainFields {
  company_id: string;
  happened_at: string; // ISO
  channel: string;
  direction: string;
  kind: string;
  summary: string | null;
  payload: any;
  created_at: string;  // ISO
}

export function rowHash(prevHash: string, f: ChainFields): string {
  const canon = canonicalize({
    company_id: f.company_id,
    happened_at: f.happened_at,
    channel: f.channel,
    direction: f.direction,
    kind: f.kind,
    summary: f.summary ?? null,
    payload: f.payload ?? {},
    created_at: f.created_at,
  });
  return crypto.createHash("sha256").update(prevHash + "‖" + canon).digest("hex");
}

type Db = {
  get: (sql: string, params?: any[]) => Promise<any>;
  run: (sql: string, params?: any[]) => Promise<{ changes: number }>;
};

export interface AppendInput {
  company_id: string;
  channel: string;
  direction: "inbound" | "outbound";
  kind: "message" | "note" | "correction" | "merge" | "system";
  summary?: string | null;
  payload?: any;
  attachment_path?: string | null;
  happened_at?: string; // defaults to created_at
}

/** Append one interaction to the chain within the caller's transaction `d`. */
export async function appendInteraction(d: Db, input: AppendInput): Promise<{ id: number; row_hash: string }> {
  await d.run("SELECT pg_advisory_xact_lock(?)", [CHAIN_LOCK_KEY]);
  const last = await d.get("SELECT row_hash FROM interactions ORDER BY id DESC LIMIT 1");
  const prev: string = last?.row_hash ?? GENESIS;

  const created_at = new Date().toISOString();
  const happened_at = input.happened_at ?? created_at;
  const fields: ChainFields = {
    company_id: input.company_id,
    happened_at,
    channel: input.channel,
    direction: input.direction,
    kind: input.kind,
    summary: input.summary ?? null,
    payload: input.payload ?? {},
    created_at,
  };
  const rh = rowHash(prev, fields);

  const row = await d.get(
    `INSERT INTO interactions
       (company_id, happened_at, channel, direction, kind, summary, payload, attachment_path, created_at, prev_hash, row_hash)
     VALUES (?,?,?,?,?,?,?::jsonb,?,?,?,?) RETURNING id`,
    [
      fields.company_id, happened_at, fields.channel, fields.direction, fields.kind,
      fields.summary, JSON.stringify(fields.payload), input.attachment_path ?? null,
      created_at, prev, rh,
    ]
  );
  return { id: Number(row.id), row_hash: rh };
}

/** Re-run the whole chain from genesis; returns the first mismatching row id, or null if intact. */
export async function verifyChain(all: (sql: string, params?: any[]) => Promise<any[]>): Promise<{ ok: boolean; count: number; brokenAtId: number | null }> {
  const rows = await all(
    "SELECT id, company_id, happened_at, channel, direction, kind, summary, payload, created_at, prev_hash, row_hash FROM interactions ORDER BY id ASC"
  );
  let prev = GENESIS;
  for (const r of rows) {
    const fields: ChainFields = {
      company_id: r.company_id,
      happened_at: new Date(r.happened_at).toISOString(),
      channel: r.channel,
      direction: r.direction,
      kind: r.kind,
      summary: r.summary ?? null,
      payload: r.payload ?? {},
      created_at: new Date(r.created_at).toISOString(),
    };
    if (r.prev_hash !== prev || rowHash(prev, fields) !== r.row_hash) {
      return { ok: false, count: rows.length, brokenAtId: Number(r.id) };
    }
    prev = r.row_hash;
  }
  return { ok: true, count: rows.length, brokenAtId: null };
}
