-- ============================================================================
-- CRM Lead Ledger — 000 bootstrap (run ONCE as the 'postgres' superuser)
-- ----------------------------------------------------------------------------
-- Creates the isolated CRM database + the two-role integrity model (SPEC v2.1 §1).
-- Only a superuser can create databases/roles/extensions.
--
-- Passwords are provided at RUN TIME (never stored in this file / git):
--   psql -U postgres -f crm/db/000_bootstrap.sql \
--        -v migrator_pw=YOUR_MIGRATOR_PW  -v app_pw=YOUR_APP_PW
--
-- crm_migrator : owns the schema, runs migrations/DDL (creds NOT in app runtime).
-- crm_app      : runtime role. DML only; INSERT+SELECT (no UPDATE/DELETE) on
--                `interactions` — granted per-table by migration 001.
-- ============================================================================
\set ON_ERROR_STOP on

-- Roles (idempotent; %L safely quotes the runtime-supplied password literal).
SELECT format('CREATE ROLE crm_migrator LOGIN PASSWORD %L', :'migrator_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'crm_migrator')\gexec

SELECT format('CREATE ROLE crm_app LOGIN PASSWORD %L', :'app_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'crm_app')\gexec

-- Isolated database (separate from other projects — no shared schema).
SELECT 'CREATE DATABASE crm OWNER crm_migrator'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'crm')\gexec

-- ── Everything below runs INSIDE the crm database ────────────────────────────
\connect crm

-- Extensions (superuser-only): fuzzy dedup (§1.5) + case-insensitive email PK.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;

-- Lock down access: nothing for PUBLIC; both roles may connect.
REVOKE ALL ON DATABASE crm FROM PUBLIC;
GRANT CONNECT ON DATABASE crm TO crm_migrator, crm_app;

-- Schema owned by the migrator; app may use it but not create objects in it.
ALTER SCHEMA public OWNER TO crm_migrator;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO crm_app;

-- Per-table DML grants (and the INSERT-only lock on `interactions`) are applied
-- by migration 001, run as crm_migrator AFTER the tables exist.
