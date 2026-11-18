/*
    DESCRIPTION: the latest decision for one pull request (newest first)
*/
SELECT
    decision_id            AS "decisionId",
    repository_full_name   AS "repositoryFullName",
    pull_request_number    AS "pullRequestNumber",
    status,
    review_note            AS "reviewNote",
    decided_by             AS "decidedBy",
    decided_at             AS "decidedAt"
FROM decisions
WHERE repository_full_name = $1
  AND pull_request_number  = $2
ORDER BY decided_at DESC
LIMIT 1;
