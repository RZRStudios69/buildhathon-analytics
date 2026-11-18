/*
    DESCRIPTION: one upsert per (repository_full_name, pull_request_number) during a sync
*/
INSERT INTO pull_requests (
    pull_request_id,
    repository_full_name,
    pull_request_number,
    title,
    body,
    author_login,
    head_ref_name,
    base_ref_name,
    html_url,
    is_draft,
    github_created_at,
    github_updated_at,
    synced_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
ON CONFLICT (repository_full_name, pull_request_number) DO UPDATE SET
    title             = EXCLUDED.title,
    body              = EXCLUDED.body,
    author_login      = EXCLUDED.author_login,
    head_ref_name     = EXCLUDED.head_ref_name,
    base_ref_name     = EXCLUDED.base_ref_name,
    html_url          = EXCLUDED.html_url,
    is_draft          = EXCLUDED.is_draft,
    github_created_at = EXCLUDED.github_created_at,
    github_updated_at = EXCLUDED.github_updated_at,
    synced_at         = EXCLUDED.synced_at
RETURNING *;
