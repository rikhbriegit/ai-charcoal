-- ============================================================================
-- CRM Lead Ledger — 001 schema (run as crm_migrator, owner of the schema)
-- ----------------------------------------------------------------------------
--   PGPASSWORD=… psql -U crm_migrator -h 127.0.0.1 -d crm -v ON_ERROR_STOP=1 \
--                -f crm/db/001_schema.sql
-- Idempotent-ish: safe to re-run (IF NOT EXISTS / CREATE OR REPLACE / DROP TRIGGER).
-- Native Postgres types (timestamptz/boolean/bigint) — NOT the SQLite-legacy
-- TEXT/0-1 conventions of the orbit project. Money = BIGINT rupiah (SPEC §1).
-- ============================================================================

-- ── Enums (§2) ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE company_status        AS ENUM ('lead','customer_digital','excluded');                       EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE touch_channel         AS ENUM ('web_form','ai_chat','whatsapp','email','ads_google','ads_meta','marketplace_b2b','outreach','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE interaction_direction AS ENUM ('inbound','outbound');                                        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE interaction_kind      AS ENUM ('message','note','correction','merge','system');              EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE pipeline_stage        AS ENUM ('new','qualified','quoted','sample_sent','negotiation','won','lost','dormant'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE container_size        AS ENUM ('20ft','40ft');                                                EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE commission_status     AS ENUM ('accrued','invoiced','paid','disputed');                      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2.1 companies ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  name_normalized    text NOT NULL UNIQUE,            -- dedup #1
  country            text,                            -- ISO-2
  city               text,
  email_domain       text,                            -- dedup #2
  phones             jsonb NOT NULL DEFAULT '[]',     -- dedup #3 (E.164 array)
  status             company_status NOT NULL DEFAULT 'lead',
  is_exclusion_list  boolean NOT NULL DEFAULT false,  -- Lampiran A (closed list)
  first_touch_at     timestamptz NOT NULL,            -- immutable (trigger)
  first_touch_channel touch_channel NOT NULL,         -- immutable (trigger)
  first_touch_ref    text,                            -- immutable (trigger)
  became_customer_at timestamptz,                     -- set on first shipment
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ── 2.2 contacts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        text,
  role        text,
  email       citext,
  phone_e164  text,
  wa_verified boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 2.3 interactions — APPEND-ONLY + HASH-CHAIN ─────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
  id              bigserial PRIMARY KEY,                 -- monotonic chain order
  company_id      uuid NOT NULL REFERENCES companies(id),
  happened_at     timestamptz NOT NULL,
  channel         touch_channel NOT NULL,
  direction       interaction_direction NOT NULL,
  kind            interaction_kind NOT NULL,
  summary         text,
  payload         jsonb NOT NULL DEFAULT '{}',
  attachment_path text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  prev_hash       text NOT NULL,                         -- hash of previous row (genesis const for #1)
  row_hash        text NOT NULL UNIQUE                   -- sha256(prev_hash ‖ canonical_json(...)) — app-computed
);

-- ── 2.4 pipeline (mutable) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline (
  company_id          uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  stage               pipeline_stage NOT NULL DEFAULT 'new',
  stage_changed_at    timestamptz NOT NULL DEFAULT now(),
  expected_containers int,
  notes               text
);

-- ── 2.5 shipments — Kontainer Terkirim ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          uuid NOT NULL REFERENCES companies(id),
  bl_number           text NOT NULL UNIQUE,             -- reconciliation key (Pasal 5)
  bl_date             date NOT NULL,                    -- commission accrues here (Pasal 4.3)
  containers          int NOT NULL CHECK (containers > 0),
  container_size      container_size NOT NULL,
  destination_country text,
  order_seq           int NOT NULL,                     -- >=2 = Repeat Order
  source_report_month text,                             -- YYYY-MM
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── 2.6 commission_ledger ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commission_ledger (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id          uuid NOT NULL UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
  amount_per_container bigint NOT NULL,                 -- rupiah, snapshot from settings
  amount_total         bigint NOT NULL,                 -- containers × amount_per_container
  status               commission_status NOT NULL DEFAULT 'accrued',
  invoiced_month       text,                            -- YYYY-MM
  paid_at              date,
  payment_proof_path   text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ── 2.7 reconciliations ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month            text NOT NULL,                       -- YYYY-MM
  report_file_path text,
  imported_rows    jsonb NOT NULL DEFAULT '[]',
  matched          int NOT NULL DEFAULT 0,
  unmatched_ours   int NOT NULL DEFAULT 0,               -- in CRM, absent from their report → possible unpaid commission
  unmatched_theirs int NOT NULL DEFAULT 0,
  resolved         boolean NOT NULL DEFAULT false,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 2.8 settings (key/value) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value text
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS companies_email_domain_idx ON companies (email_domain);
CREATE INDEX IF NOT EXISTS companies_status_idx        ON companies (status);
-- pg_trgm fuzzy dedup suggestions (§1.5) — Arabic/Persian transliteration variants.
CREATE INDEX IF NOT EXISTS companies_name_trgm_idx     ON companies USING gin (name_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS interactions_company_idx    ON interactions (company_id, id);
CREATE INDEX IF NOT EXISTS shipments_company_idx       ON shipments (company_id);

-- ── Trigger: companies — updated_at + immutable first_touch_* ────────────────
CREATE OR REPLACE FUNCTION companies_guard() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.first_touch_at     IS DISTINCT FROM OLD.first_touch_at
    OR NEW.first_touch_channel IS DISTINCT FROM OLD.first_touch_channel
    OR NEW.first_touch_ref    IS DISTINCT FROM OLD.first_touch_ref THEN
      RAISE EXCEPTION 'first_touch_* is immutable (first-touch is a fact, not opinion)';
    END IF;
    NEW.updated_at := now();
  END IF;
  -- Exclusion list is closed once settings.exclusion_locked_at is set (poin 3).
  IF NEW.is_exclusion_list
     AND (TG_OP = 'INSERT' OR NOT OLD.is_exclusion_list) THEN
    IF (SELECT value FROM settings WHERE key = 'exclusion_locked_at') IS NOT NULL THEN
      RAISE EXCEPTION 'Daftar Pengecualian sudah terkunci (exclusion_locked_at); tidak bisa menambah entri';
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS companies_guard_trg ON companies;
CREATE TRIGGER companies_guard_trg
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION companies_guard();

-- ── Trigger: interactions — APPEND-ONLY (layer 2; layer 1 = role grant) ─────
CREATE OR REPLACE FUNCTION interactions_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'interactions is append-only: % is forbidden (evidence ledger)', TG_OP;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interactions_no_update ON interactions;
DROP TRIGGER IF EXISTS interactions_no_delete ON interactions;
CREATE TRIGGER interactions_no_update BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION interactions_append_only();
CREATE TRIGGER interactions_no_delete BEFORE DELETE ON interactions FOR EACH ROW EXECUTE FUNCTION interactions_append_only();

-- ── Grants to crm_app (runtime role) — layer 1 of append-only ───────────────
-- Full DML on business/mutable tables…
GRANT SELECT, INSERT, UPDATE, DELETE ON companies, contacts, pipeline, shipments, commission_ledger, reconciliations, settings TO crm_app;
-- …but INSERT + SELECT only on interactions (NO UPDATE/DELETE — enforced by engine).
GRANT SELECT, INSERT ON interactions TO crm_app;
-- Sequences (bigserial interactions.id) need USAGE for INSERT.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO crm_app;

-- ── Seed settings ───────────────────────────────────────────────────────────
INSERT INTO settings (key, value) VALUES
  ('commission_per_container', '2250000')      -- Rp2.250.000 / container (Pasal 4)
ON CONFLICT (key) DO NOTHING;
-- These two are seeded LATER with real contract data (need Lampiran A + Tanggal Efektif):
INSERT INTO settings (key, value) VALUES
  ('exclusion_locked_at', NULL),               -- set AFTER seeding Lampiran A → closes the list
  ('attribution_start_date', NULL)             -- Tanggal Efektif Kesepakatan Awal
ON CONFLICT (key) DO NOTHING;
