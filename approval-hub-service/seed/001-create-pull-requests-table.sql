/*
    DESCRIPTION: synced GitHub pull requests; one row per (repository, number)
    Applied once by seed/migrate.js. Never edit this file after it has run: add 002-...sql instead.
*/
CREATE TABLE IF NOT EXISTS pull_requests (
    pull_request_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_full_name   VARCHAR(200) NOT NULL,
    pull_request_number    INTEGER NOT NULL,
    title                  VARCHAR(500) NOT NULL,
    body                   TEXT,
    author_login           VARCHAR(100) NOT NULL,
    head_ref_name          VARCHAR(200) NOT NULL,
    base_ref_name          VARCHAR(200) NOT NULL,
    html_url               VARCHAR(2048) NOT NULL,
    is_draft               BOOLEAN NOT NULL DEFAULT FALSE,
    github_created_at      TIMESTAMPTZ NOT NULL,
    github_updated_at      TIMESTAMPTZ NOT NULL,
    synced_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_repository_pull_request UNIQUE (repository_full_name, pull_request_number)
);

-- Serves the board's default order (newest GitHub activity first)
CREATE INDEX IF NOT EXISTS idx_pull_requests_updated_at ON pull_requests (github_updated_at DESC);

-- Serves the per-repository counts used by the milestone panel
CREATE INDEX IF NOT EXISTS idx_pull_requests_repository ON pull_requests (repository_full_name);
