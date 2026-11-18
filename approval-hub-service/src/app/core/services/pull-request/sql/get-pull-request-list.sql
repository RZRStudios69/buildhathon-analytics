/*
    DESCRIPTION: every synced pull request, joined with its latest decision (newest first)
*/
SELECT
    pull_requests.pull_request_id       AS "pullRequestId",
    pull_requests.repository_full_name  AS "repositoryFullName",
    pull_requests.pull_request_number   AS "pullRequestNumber",
    pull_requests.title,
    pull_requests.body,
    pull_requests.author_login          AS "authorLogin",
    pull_requests.head_ref_name         AS "headRefName",
    pull_requests.base_ref_name         AS "baseRefName",
    pull_requests.html_url              AS "htmlUrl",
    pull_requests.is_draft              AS "isDraft",
    pull_requests.github_created_at     AS "githubCreatedAt",
    pull_requests.github_updated_at     AS "githubUpdatedAt",
    pull_requests.synced_at             AS "syncedAt",
    latest_decisions.status             AS "decision",
    latest_decisions.decided_at         AS "decidedAt",
    latest_decisions.review_note        AS "reviewNote",
    latest_decisions.decided_by         AS "decidedBy"
FROM pull_requests
LEFT JOIN LATERAL (
    SELECT *
    FROM decisions
    WHERE decisions.repository_full_name = pull_requests.repository_full_name
      AND decisions.pull_request_number  = pull_requests.pull_request_number
    ORDER BY decisions.decided_at DESC
    LIMIT 1
) AS latest_decisions ON TRUE
WHERE ($1::text IS NULL OR pull_requests.repository_full_name = $1)
ORDER BY pull_requests.github_updated_at DESC;
