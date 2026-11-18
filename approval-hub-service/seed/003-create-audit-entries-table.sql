/*
    DESCRIPTION: the audit log; one row per recorded decision, written only after the decision succeeds
    Applied once by seed/migrate.js. Never edit this file after it has run: add 004-...sql instead.
*/
CREATE TABLE IF NOT EXISTS audit_entries (
    audit_entry_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action                 VARCHAR(20) NOT NULL,                     -- approved | rejected
    repository_full_name   VARCHAR(200) NOT NULL,
    pull_request_number    INTEGER NOT NULL,
    pull_request_title     VARCHAR(500) NOT NULL,
    review_note            VARCHAR(500),
    performed_by           VARCHAR(100) NOT NULL,
    occurred_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Serves the audit trail's newest-first order
CREATE INDEX IF NOT EXISTS idx_audit_entries_occurred_at ON audit_entries (occurred_at DESC);
