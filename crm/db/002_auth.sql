-- ============================================================================
-- CRM Lead Ledger — 002 auth accounts (run as crm_migrator)
--   PGPASSWORD=… psql -U crm_migrator -h 127.0.0.1 -d crm -v ON_ERROR_STOP=1 \
--                -f crm/db/002_auth.sql
-- Single-user CRM: one row per allowlisted login. token_version drives session
-- revocation (bumped on logout/compromise). Password itself lives in env
-- (CRM_FALLBACK_PW_HASH) for the fallback path — not stored here.
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
  email         citext PRIMARY KEY,
  name          text,
  auth_provider text NOT NULL DEFAULT 'password',   -- 'google' | 'password'
  token_version int  NOT NULL DEFAULT 0,             -- session revocation counter
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- crm_app needs UPDATE here (token_version bump on logout) — NOT an append-only table.
GRANT SELECT, INSERT, UPDATE ON accounts TO crm_app;
