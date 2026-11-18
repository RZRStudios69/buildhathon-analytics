/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { HttpStatus, Injectable } from '@nestjs/common';
import { GithubPullRequest, GithubService } from 'app/core/providers/github/github.service';
import { LogService } from 'app/core/providers/log/log.service';
import { PostgresService } from 'app/core/providers/postgres/postgres.service';
import { DecisionStatus, PullRequestWithDecision } from 'app/core/services/pull-request/pull-request.types';
import { readSQLFile } from 'app/core/utils/sql-reader.util';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';

@Injectable()
export class PullRequestService {

    /**
     * Constructor
     */
    constructor(
        private readonly _logService: LogService,
        private readonly _postgresService: PostgresService,
        private readonly _githubService: GithubService,
    ) {
        this._logService.registerClassName(PullRequestService.name);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private readonly getPullRequestListQuery = readSQLFile(__dirname, 'sql/get-pull-request-list.sql');
    async getPullRequestList(params: { repositoryFullName?: string }): Promise<PullRequestWithDecision[]> {
        const { repositoryFullName } = params;

        try {
            const result = await this._postgresService.query<PullRequestWithDecision>(this.getPullRequestListQuery, [repositoryFullName ?? null]);
            return result.rows;
        } catch (error) {
            throw this.toQueryException(error, 'GET_PULL_REQUEST_LIST_THROWN');
        }
    }

    /**
     * Fetch the open pull requests of every configured repository from GitHub and upsert them locally.
     * A repository that cannot be read (renamed, removed, network) is logged and skipped, never fatal.
     */
    async syncPullRequestsFromGithub(): Promise<{ syncedRepositories: number; syncedPullRequests: number }> {
        const configuredRepositories = this.parseConfiguredRepositories();
        const syncedPullRequests = await Promise.all(configuredRepositories.map((repositoryFullName) => this.syncOneRepository(repositoryFullName)));
        const totalSyncedPullRequests = syncedPullRequests.reduce((repositoryTotal, repositoryPullRequests) => repositoryTotal + repositoryPullRequests.length, 0);

        this._logService.log(`Synced ${totalSyncedPullRequests} pull requests from ${configuredRepositories.length} repositories`);

        return { syncedRepositories: configuredRepositories.length, syncedPullRequests: totalSyncedPullRequests };
    }

    private readonly getPullRequestQuery = readSQLFile(__dirname, 'sql/get-pull-request.sql');
    async getPullRequest(params: { repositoryFullName: string; pullRequestNumber: number }): Promise<PullRequestWithDecision | null> {
        const { repositoryFullName, pullRequestNumber } = params;

        try {
            const result = await this._postgresService.query<PullRequestWithDecision>(this.getPullRequestQuery, [repositoryFullName, pullRequestNumber]);
            const [pullRequest] = result.rows;
            return pullRequest ?? null;
        } catch (error) {
            throw this.toQueryException(error, 'GET_PULL_REQUEST_THROWN');
        }
    }

    private readonly upsertPullRequestQuery = readSQLFile(__dirname, 'sql/upsert-pull-request.sql');
    async upsertPullRequest(params: { githubPullRequest: GithubPullRequest }): Promise<void> {
        const { githubPullRequest } = params;

        try {
            const binds = [
                crypto.randomUUID(),
                githubPullRequest.repositoryFullName,
                githubPullRequest.pullRequestNumber,
                githubPullRequest.title,
                githubPullRequest.body,
                githubPullRequest.authorLogin,
                githubPullRequest.headRefName,
                githubPullRequest.baseRefName,
                githubPullRequest.htmlUrl,
                githubPullRequest.draft,
                githubPullRequest.createdAt,
                githubPullRequest.updatedAt,
                new Date(),
            ];

            await this._postgresService.query(this.upsertPullRequestQuery, binds);
        } catch (error) {
            throw this.toQueryException(error, 'UPSERT_PULL_REQUEST_THROWN');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private async syncOneRepository(repositoryFullName: string): Promise<GithubPullRequest[]> {
        try {
            const openPullRequests = await this._githubService.getOpenPullRequests(repositoryFullName);
            await Promise.all(openPullRequests.map((githubPullRequest) => this.upsertPullRequest({ githubPullRequest })));
            return openPullRequests;
        } catch (error) {
            this._logService.warn(`Skipping repository ${repositoryFullName}: GitHub request failed`);
            return [];
        }
    }

    private parseConfiguredRepositories(): string[] {
        return (process.env.GITHUB_REPOSITORIES ?? '')
            .split(',')
            .map((configuredRepository) => configuredRepository.trim())
            .filter(Boolean);
    }

    /**
     * Our own DefaultHttpException passes through unchanged. Anything else is logged and becomes a 503
     * whose `error` reaches the client only when ENABLE_DEBUGGING=true.
     */
    private toQueryException(error: unknown, reason: string): DefaultHttpException {
        if (error instanceof DefaultHttpException) {
            return error;
        }

        const errorMessage = error instanceof Error ? error.message : `${error}`;
        this._logService.error(`Pull request query failed: ${reason}`, errorMessage);

        return new DefaultHttpException({
            message: 'Pull request query execution failed',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            code: 'POSTGRES_EXECUTION_ERROR',
            error: {
                reason,
                error: errorMessage,
            },
            module: PullRequestService.name,
        });
    }
}
