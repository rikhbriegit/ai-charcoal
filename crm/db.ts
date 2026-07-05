// CRM Postgres data layer. Lazy pool so importing this module never throws when
// CRM env is absent (keeps the marketing server bootable without CRM config).
// Query helpers ported from orbit-ai-chat-embedded (the "?" → "$n" convenience
// keeps call sites portable). Runtime uses the crm_app role (DML only; INSERT-only
// on `interactions`, enforced by the DB engine).
import pg from "pg";

let _pool: pg.Pool | null = null;
export function pool(): pg.Pool {
  if (!_pool) {
    const url = process.env.CRM_DATABASE_URL;
    if (!url) throw new Error("CRM_DATABASE_URL belum di-set.");
    _pool = new pg.Pool({
      connectionString: url,
      max: 10,
      ssl: process.env.CRM_DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return _pool;
}

// Rewrite "?" placeholders → "$1,$2,…" (Postgres positional params).
function conv(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export async function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const r = await pool().query(conv(sql), params);
  return r.rows[0] as T | undefined;
}
export async function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const r = await pool().query(conv(sql), params);
  return r.rows as T[];
}
export async function run(sql: string, params: any[] = []): Promise<{ changes: number }> {
  const r = await pool().query(conv(sql), params);
  return { changes: r.rowCount ?? 0 };
}

// Transaction: all statements on one client, BEGIN/COMMIT/ROLLBACK.
export async function tx<T>(
  fn: (d: {
    get: (sql: string, params?: any[]) => Promise<any>;
    all: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<{ changes: number }>;
  }) => Promise<T>
): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("BEGIN");
    const d = {
      get: async (s: string, p: any[] = []) => (await c.query(conv(s), p)).rows[0],
      all: async (s: string, p: any[] = []) => (await c.query(conv(s), p)).rows,
      run: async (s: string, p: any[] = []) => ({ changes: (await c.query(conv(s), p)).rowCount ?? 0 }),
    };
    const out = await fn(d);
    await c.query("COMMIT");
    return out;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
