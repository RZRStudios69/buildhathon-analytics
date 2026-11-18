/*
    DESCRIPTION: one row per recorded approve/reject decision; the latest row per pull request is its current status
    Applied once by seed/migrate.js. Never edit this file after it has run: add 003-...sql instead.
*/
CREATE TABLE IF NOT EXISTS decisions (
    decision_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_full_name   VARCHAR(200) NOT NULL,
    pull_request_number    INTEGER NOT NULL,
    status                 VARCHAR(20) NOT NULL,                     -- APPROVED | REJECTED
    review_note            VARCHAR(500),
    decided_by             VARCHAR(100) NOT NULL,
    decided_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Serves the "latest decision per pull request" join
CREATE INDEX IF NOT EXISTS idx_decisions_repository_pull_request ON decisions (repository_full_name, pull_request_number, decided_at DESC);
