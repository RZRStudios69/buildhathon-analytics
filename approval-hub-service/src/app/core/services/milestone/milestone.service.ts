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
import { GithubMilestone, GithubService } from 'app/core/providers/github/github.service';
import { LogService } from 'app/core/providers/log/log.service';
import { PostgresService } from 'app/core/providers/postgres/postgres.service';
import { Milestone } from 'app/core/services/milestone/milestone.types';
import { readSQLFile } from 'app/core/utils/sql-reader.util';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';

@Injectable()
export class MilestoneService {

    /**
     * Constructor
     */
    constructor(
        private readonly _logService: LogService,
        private readonly _postgresService: PostgresService,
        private readonly _githubService: GithubService,
    ) {
        this._logService.registerClassName(MilestoneService.name);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private readonly getRepositoryPullRequestCountQuery = readSQLFile(__dirname, 'sql/get-repository-pull-request-count.sql');
    async getMilestoneList(): Promise<Milestone[]> {
        try {
            const milestoneLists = await Promise.all(this.parseConfiguredRepositories().map((repositoryFullName) => this.getMilestonesOfRepository(repositoryFullName)));
            return milestoneLists.flat();
        } catch (error) {
            throw this.toQueryException(error, 'GET_MILESTONE_LIST_THROWN');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * A repository that cannot be read (renamed, removed, network) is logged and skipped, never fatal
     */
    private async getMilestonesOfRepository(repositoryFullName: string): Promise<Milestone[]> {
        try {
            const openMilestones = await this._githubService.getOpenMilestones(repositoryFullName);
            return await Promise.all(openMilestones.map((githubMilestone) => this.toMilestone(githubMilestone)));
        } catch (error) {
            this._logService.warn(`Skipping milestones of ${repositoryFullName}: GitHub request failed`);
            return [];
        }
    }

    private async toMilestone(githubMilestone: GithubMilestone): Promise<Milestone> {
        const result = await this._postgresService.query<{ pullRequestCount: number }>(this.getRepositoryPullRequestCountQuery, [githubMilestone.repositoryFullName]);
        const [{ pullRequestCount }] = result.rows;

        return {
            repositoryFullName    : githubMilestone.repositoryFullName,
            milestoneTitle        : githubMilestone.milestoneTitle,
            dueOn                 : githubMilestone.dueOn,
            openIssues            : githubMilestone.openIssues,
            closedIssues          : githubMilestone.closedIssues,
            pullRequestCount      : pullRequestCount ?? 0,
        };
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
        this._logService.error(`Milestone query failed: ${reason}`, errorMessage);

        return new DefaultHttpException({
            message: 'Milestone query execution failed',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            code: 'POSTGRES_EXECUTION_ERROR',
            error: {
                reason,
                error: errorMessage,
            },
            module: MilestoneService.name,
        });
    }
}
