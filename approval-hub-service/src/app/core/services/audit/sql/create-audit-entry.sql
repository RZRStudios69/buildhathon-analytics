/*
    DESCRIPTION: one audit entry per recorded decision; written after the decision insert succeeds
*/
INSERT INTO audit_entries (
    action,
    repository_full_name,
    pull_request_number,
    pull_request_title,
    review_note,
    performed_by
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING
    audit_entry_id         AS "auditEntryId",
    action,
    repository_full_name   AS "repositoryFullName",
    pull_request_number    AS "pullRequestNumber",
    pull_request_title     AS "pullRequestTitle",
    review_note            AS "reviewNote",
    performed_by           AS "performedBy",
    occurred_at            AS "occurredAt";
