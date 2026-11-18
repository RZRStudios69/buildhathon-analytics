/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

export interface AuditEntry {
    auditEntryId        : string;
    action              : string;
    repositoryFullName  : string;
    pullRequestNumber   : number;
    pullRequestTitle    : string;
    reviewNote          : string | null;
    performedBy         : string;
    occurredAt          : Date;
}
