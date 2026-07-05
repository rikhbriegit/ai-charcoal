-- ============================================================================
-- CRM Lead Ledger — 003 unparsed chat leads (run as crm_migrator)
--   PGPASSWORD=… psql -U crm_migrator -h 127.0.0.1 -d crm -v ON_ERROR_STOP=1 \
--                -f crm/db/003_unparsed.sql
-- Chat conversations where lead extraction failed OR returned buyer-intent but
-- weak/incomplete identity → queued here for manual review in the Inbox (§5.1).
-- ============================================================================
CREATE TABLE IF NOT EXISTS unparsed_leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript jsonb NOT NULL,          -- { conversationId, history: [{role,text}] }
  reason     text,                    -- extraction_failed | low_confidence_or_no_identity
  extracted  jsonb,                   -- the model's best-effort JSON (if any)
  resolved   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Mutable review queue (not an evidence table) → crm_app gets full DML.
GRANT SELECT, INSERT, UPDATE, DELETE ON unparsed_leads TO crm_app;
