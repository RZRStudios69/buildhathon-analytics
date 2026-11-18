/*
    DESCRIPTION: the audit log: every decision ever recorded, newest first
*/
SELECT
    audit_entry_id         AS "auditEntryId",
    action,
    repository_full_name   AS "repositoryFullName",
    pull_request_number    AS "pullRequestNumber",
    pull_request_title     AS "pullRequestTitle",
    review_note            AS "reviewNote",
    performed_by           AS "performedBy",
    occurred_at            AS "occurredAt"
FROM audit_entries
ORDER BY occurred_at DESC
LIMIT $1;
