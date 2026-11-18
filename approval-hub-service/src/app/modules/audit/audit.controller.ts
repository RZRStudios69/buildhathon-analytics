/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Controller, Get, Query, Request, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'app/core/decorators/public.decorator';
import { AuditService } from 'app/core/services/audit/audit.service';
import { AuditEntriesQueryParam } from 'app/modules/audit/audit.dto';
import { AppCode } from 'app/core/types/app.types';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';
import { DefaultHttpResponse } from 'app/shared/custom/http-response/default.http-response';

/**
 * Local, login-less deployment: every handler is @Public() and the service binds to 127.0.0.1 only.
 */
@ApiTags('Audit')
@Public()
@Controller()
export class AuditController {

    /**
     * Constructor
     */
    constructor(
        private readonly _auditService: AuditService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @Get('list')
    @ApiOperation({
        summary: 'Get the audit trail',
        description: 'Returns the recorded decisions, newest first.',
    })
    async getAuditEntryList(
        @Request() request,
        @Response() response,
        @Query() query: AuditEntriesQueryParam,
    ) {
        try {
            const auditEntries = await this._auditService.getAuditEntryList({ limit: query.limit });

            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: successCode.code,
                message: successCode.description,
                statusCode: successCode.status,
                data: auditEntries,
            });

            response.status(result.statusCode);
            response.json(result);
            return response;
        } catch (error) {
            throw new DefaultHttpException(error);
        }
    }
}
