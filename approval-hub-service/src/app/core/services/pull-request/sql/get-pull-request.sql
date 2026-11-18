/*
    DESCRIPTION: one pull request by repository and number
*/
SELECT
    pull_request_id            AS "pullRequestId",
    repository_full_name       AS "repositoryFullName",
    pull_request_number        AS "pullRequestNumber",
    title,
    body,
    author_login               AS "authorLogin",
    head_ref_name              AS "headRefName",
    base_ref_name              AS "baseRefName",
    html_url                   AS "htmlUrl",
    is_draft                   AS "isDraft",
    github_created_at          AS "githubCreatedAt",
    github_updated_at          AS "githubUpdatedAt",
    synced_at                  AS "syncedAt"
FROM pull_requests
WHERE repository_full_name = $1
  AND pull_request_number  = $2
LIMIT 1;
