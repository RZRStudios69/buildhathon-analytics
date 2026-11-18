/*
    DESCRIPTION: count of synced pull requests per repository
*/
SELECT COUNT(*)::int AS "pullRequestCount"
FROM pull_requests
WHERE repository_full_name = $1;
