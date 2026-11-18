/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { Controller, Get, Request, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'app/core/decorators/public.decorator';
import { PostgresService } from 'app/core/providers/postgres/postgres.service';
import { AppCode } from 'app/core/types/app.types';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';
import { DefaultHttpResponse } from 'app/shared/custom/http-response/default.http-response';

@ApiTags('Health')
@Controller()
export class HealthController {

    /**
     * Constructor
     */
    constructor(
        private readonly _postgresService: PostgresService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @Get()
    @Public()
    @ApiOperation({
        summary: 'Health check',
        description: 'Returns 200 when Postgres answers and 503 when it does not. The compose healthcheck calls it.',
    })
    async healthCheck(
        @Request() request,
        @Response() response,
    ) {
        try {
            const isConnected = await this._postgresService.testConnection();
            if (!isConnected) {
                const failedCode = AppCode.SERVICE_UNAVAILABLE;
                throw new DefaultHttpException({
                    message: failedCode.description,
                    code: failedCode.code,
                    statusCode: failedCode.status,
                    error: { reason: 'POSTGRES_DISCONNECTED' },
                    module: HealthController.name,
                });
            }

            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: successCode.code,
                message: successCode.description,
                statusCode: successCode.status,
                data: { status: 'healthy', postgres: 'connected' },
            });

            response.status(result.statusCode);
            response.json(result);
            return response;
        } catch (error) {
            throw new DefaultHttpException(error);
        }
    }
}
