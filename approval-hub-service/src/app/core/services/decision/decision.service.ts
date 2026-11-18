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
import { LogService } from 'app/core/providers/log/log.service';
import { PostgresService } from 'app/core/providers/postgres/postgres.service';
import { Decision } from 'app/core/services/decision/decision.types';
import { DecisionStatus } from 'app/core/services/pull-request/pull-request.types';
import { readSQLFile } from 'app/core/utils/sql-reader.util';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';

@Injectable()
export class DecisionService {

    /**
     * Constructor
     */
    constructor(
        private readonly _logService: LogService,
        private readonly _postgresService: PostgresService,
    ) {
        this._logService.registerClassName(DecisionService.name);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private readonly createDecisionQuery = readSQLFile(__dirname, 'sql/create-decision.sql');
    /**
     * Records one decision. The decision is only recorded locally: nothing is ever written to GitHub.
     */
    async createDecision(params: {
        repositoryFullName    : string;
        pullRequestNumber     : number;
        status                : DecisionStatus.APPROVED | DecisionStatus.REJECTED;
        reviewNote?           : string;
        decidedBy             : string;
    }): Promise<Decision> {
        const { repositoryFullName, pullRequestNumber, status, reviewNote, decidedBy } = params;

        try {
            const binds = [repositoryFullName, pullRequestNumber, status, reviewNote?.trim() ? reviewNote.trim() : null, decidedBy];
            const result = await this._postgresService.query<Decision>(this.createDecisionQuery, binds);
            const [decision] = result.rows;
            return decision;
        } catch (error) {
            throw this.toQueryException(error, 'CREATE_DECISION_THROWN');
        }
    }

    private readonly getLatestDecisionQuery = readSQLFile(__dirname, 'sql/get-latest-decision.sql');
    async getLatestDecision(params: { repositoryFullName: string; pullRequestNumber: number }): Promise<Decision | null> {
        const { repositoryFullName, pullRequestNumber } = params;

        try {
            const result = await this._postgresService.query<Decision>(this.getLatestDecisionQuery, [repositoryFullName, pullRequestNumber]);
            const [decision] = result.rows;
            return decision ?? null;
        } catch (error) {
            throw this.toQueryException(error, 'GET_LATEST_DECISION_THROWN');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Our own DefaultHttpException passes through unchanged. Anything else is logged and becomes a 503
     * whose `error` reaches the client only when ENABLE_DEBUGGING=true.
     */
    private toQueryException(error: unknown, reason: string): DefaultHttpException {
        if (error instanceof DefaultHttpException) {
            return error;
        }

        const errorMessage = error instanceof Error ? error.message : `${error}`;
        this._logService.error(`Decision query failed: ${reason}`, errorMessage);

        return new DefaultHttpException({
            message: 'Decision query execution failed',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            code: 'POSTGRES_EXECUTION_ERROR',
            error: {
                reason,
                error: errorMessage,
            },
            module: DecisionService.name,
        });
    }
}
