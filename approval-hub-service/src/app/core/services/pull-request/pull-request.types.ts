/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

export interface PullRequest {
    pullRequestId        : string;
    repositoryFullName   : string;
    pullRequestNumber    : number;
    title                : string;
    body                 : string | null;
    authorLogin          : string;
    headRefName          : string;
    baseRefName          : string;
    htmlUrl              : string;
    isDraft              : boolean;
    githubCreatedAt      : Date;
    githubUpdatedAt      : Date;
    syncedAt             : Date;
}

export interface PullRequestWithDecision extends PullRequest {
    decision     : DecisionStatus | null;
    decidedAt    : Date | null;
    reviewNote   : string | null;
    decidedBy    : string | null;
}

export enum DecisionStatus {
    PENDING     = 'PENDING',
    APPROVED    = 'APPROVED',
    REJECTED    = 'REJECTED',
}

/**
 * Keys are used in coding,
 * Values are used in sql
 */
export enum PullRequestColumns {
    pullRequestId      = 'pull_request_id',
    repositoryFullName = 'repository_full_name',
    pullRequestNumber  = 'pull_request_number',
    title              = 'title',
    authorLogin        = 'author_login',
    githubUpdatedAt    = 'github_updated_at',
    syncedAt           = 'synced_at',
}
