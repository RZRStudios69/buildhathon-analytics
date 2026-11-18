/*
    DESCRIPTION: one row per approve/reject decision; the latest row per pull request is its current status
*/
INSERT INTO decisions (
    repository_full_name,
    pull_request_number,
    status,
    review_note,
    decided_by
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING
    decision_id            AS "decisionId",
    repository_full_name   AS "repositoryFullName",
    pull_request_number    AS "pullRequestNumber",
    status,
    review_note            AS "reviewNote",
    decided_by             AS "decidedBy",
    decided_at             AS "decidedAt";
