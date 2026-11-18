/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

export interface Decision {
    decisionId           : string;
    repositoryFullName   : string;
    pullRequestNumber    : number;
    status               : string;
    reviewNote           : string | null;
    decidedBy            : string;
    decidedAt            : Date;
}
