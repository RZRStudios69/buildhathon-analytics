/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const OPEN_PULL_REQUESTS_PER_REPOSITORY = 30;

/**
 * What the GitHub REST API returns for one open pull request; only the fields Approval Hub uses
 */
export interface GithubPullRequest {
    repositoryFullName   : string;
    pullRequestNumber    : number;
    title                : string;
    body                 : string | null;
    authorLogin          : string;
    headRefName          : string;
    baseRefName          : string;
    htmlUrl              : string;
    draft                : boolean;
    createdAt            : string;
    updatedAt            : string;
}

interface GithubApiPullRequest {
    number       : number;
    title        : string;
    body         : string | null;
    user         : { login: string } | null;
    head         : { ref: string };
    base         : { ref: string };
    html_url     : string;
    draft        : boolean;
    created_at   : string;
    updated_at   : string;
}

/**
 * What the GitHub REST API returns for one open milestone; only the fields Approval Hub uses
 */
export interface GithubMilestone {
    repositoryFullName    : string;
    milestoneNumber       : number;
    milestoneTitle        : string;
    dueOn                 : string | null;
    openIssues            : number;
    closedIssues          : number;
}

interface GithubApiMilestone {
    number          : number;
    title           : string;
    due_on          : string | null;
    open_issues     : number;
    closed_issues   : number;
}

/**
 * Read-only client for the GitHub REST API. The service never writes to GitHub:
 * it lists open pull requests for the configured repositories and nothing else.
 */
@Injectable()
export class GithubService {

    private readonly logger = new Logger(GithubService.name);

    /**
     * Constructor
     */
    constructor(
        private readonly _httpService: HttpService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the open pull requests of one repository, newest first
     *
     * @param repositoryFullName
     */
    async getOpenPullRequests(repositoryFullName: string): Promise<GithubPullRequest[]> {
        const requestUrl = `${GITHUB_API_BASE_URL}/repos/${repositoryFullName}/pulls`;

        try {
            const response = await firstValueFrom(
                this._httpService.get<GithubApiPullRequest[]>(requestUrl, {
                    params: { state: 'open', sort: 'updated', direction: 'desc', per_page: OPEN_PULL_REQUESTS_PER_REPOSITORY },
                    headers: this.buildRequestHeaders(),
                }),
            );

            return response.data.map((apiPullRequest) => this.toGithubPullRequest(apiPullRequest, repositoryFullName));
        } catch (error) {
            const failureStatus = error?.response?.status;
            this.logger.error(`GitHub list pull requests failed for ${repositoryFullName} (${failureStatus ?? error?.name})`);
            throw error;
        }
    }

    /**
     * Get the open milestones of one repository
     *
     * @param repositoryFullName
     */
    async getOpenMilestones(repositoryFullName: string): Promise<GithubMilestone[]> {
        const requestUrl = `${GITHUB_API_BASE_URL}/repos/${repositoryFullName}/milestones`;

        try {
            const response = await firstValueFrom(
                this._httpService.get<GithubApiMilestone[]>(requestUrl, {
                    params: { state: 'open', per_page: 20 },
                    headers: this.buildRequestHeaders(),
                }),
            );

            return response.data.map((apiMilestone) => this.toGithubMilestone(apiMilestone, repositoryFullName));
        } catch (error) {
            const failureStatus = error?.response?.status;
            this.logger.error(`GitHub list milestones failed for ${repositoryFullName} (${failureStatus ?? error?.name})`);
            throw error;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Unauthenticated requests against public repositories: no account and no token of any real user is used.
     * A throwaway GITHUB_API_TOKEN may be set for rate limits; it never carries permissions beyond public reads.
     */
    private buildRequestHeaders(): Record<string, string> {
        return {
            'Accept'               : 'application/vnd.github+json',
            'X-GitHub-Api-Version' : '2022-11-28',
        };
    }

    private toGithubMilestone(apiMilestone: GithubApiMilestone, repositoryFullName: string): GithubMilestone {
        return {
            repositoryFullName    : repositoryFullName,
            milestoneNumber       : apiMilestone.number,
            milestoneTitle        : apiMilestone.title,
            dueOn                 : apiMilestone.due_on,
            openIssues            : apiMilestone.open_issues,
            closedIssues          : apiMilestone.closed_issues,
        };
    }

    private toGithubPullRequest(apiPullRequest: GithubApiPullRequest, repositoryFullName: string): GithubPullRequest {
        return {
            repositoryFullName   : repositoryFullName,
            pullRequestNumber    : apiPullRequest.number,
            title                : apiPullRequest.title,
            body                 : apiPullRequest.body,
            authorLogin          : apiPullRequest.user?.login ?? 'unknown',
            headRefName          : apiPullRequest.head?.ref ?? 'unknown',
            baseRefName          : apiPullRequest.base?.ref ?? 'unknown',
            htmlUrl              : apiPullRequest.html_url,
            draft                : apiPullRequest.draft ?? false,
            createdAt            : apiPullRequest.created_at,
            updatedAt            : apiPullRequest.updated_at,
        };
    }
}
