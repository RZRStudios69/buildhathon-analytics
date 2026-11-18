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
import { AuditEntry } from 'app/core/services/audit/audit.types';
import { readSQLFile } from 'app/core/utils/sql-reader.util';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';

@Injectable()
export class AuditService {

    /**
     * Constructor
     */
    constructor(
        private readonly _logService: LogService,
        private readonly _postgresService: PostgresService,
    ) {
        this._logService.registerClassName(AuditService.name);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private readonly getAuditEntryListQuery = readSQLFile(__dirname, 'sql/get-audit-entry-list.sql');
    async getAuditEntryList(params: { limit: number }): Promise<AuditEntry[]> {
        const { limit } = params;

        try {
            const result = await this._postgresService.query<AuditEntry>(this.getAuditEntryListQuery, [limit]);
            return result.rows;
        } catch (error) {
            throw this.toQueryException(error, 'GET_AUDIT_ENTRY_LIST_THROWN');
        }
    }

    private readonly createAuditEntryQuery = readSQLFile(__dirname, 'sql/create-audit-entry.sql');
    /**
     * Writes one audit entry. Callers write it only after the action it describes has succeeded.
     */
    async createAuditEntry(params: {
        action               : string;
        repositoryFullName   : string;
        pullRequestNumber    : number;
        pullRequestTitle     : string;
        reviewNote?          : string;
        performedBy          : string;
    }): Promise<AuditEntry> {
        const { action, repositoryFullName, pullRequestNumber, pullRequestTitle, reviewNote, performedBy } = params;

        try {
            const binds = [action, repositoryFullName, pullRequestNumber, pullRequestTitle, reviewNote?.trim() ? reviewNote.trim() : null, performedBy];
            const result = await this._postgresService.query<AuditEntry>(this.createAuditEntryQuery, binds);
            const [auditEntry] = result.rows;
            return auditEntry;
        } catch (error) {
            throw this.toQueryException(error, 'CREATE_AUDIT_ENTRY_THROWN');
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
        this._logService.error(`Audit query failed: ${reason}`, errorMessage);

        return new DefaultHttpException({
            message: 'Audit query execution failed',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            code: 'POSTGRES_EXECUTION_ERROR',
            error: {
                reason,
                error: errorMessage,
            },
            module: AuditService.name,
        });
    }
}
