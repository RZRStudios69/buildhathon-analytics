/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Controller, Get, Request, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'app/core/decorators/public.decorator';
import { MilestoneService } from 'app/core/services/milestone/milestone.service';
import { AppCode } from 'app/core/types/app.types';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';
import { DefaultHttpResponse } from 'app/shared/custom/http-response/default.http-response';

/**
 * Local, login-less deployment: every handler is @Public() and the service binds to 127.0.0.1 only.
 */
@ApiTags('Milestone')
@Public()
@Controller()
export class MilestoneController {

    /**
     * Constructor
     */
    constructor(
        private readonly _milestoneService: MilestoneService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @Get('list')
    @ApiOperation({
        summary: 'Get the open milestones',
        description: 'Returns the open GitHub milestones of the configured repositories, each with the repository\'s synced pull-request count.',
    })
    async getMilestoneList(
        @Request() request,
        @Response() response,
    ) {
        try {
            const milestones = await this._milestoneService.getMilestoneList();

            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: successCode.code,
                message: successCode.description,
                statusCode: successCode.status,
                data: milestones,
            });

            response.status(result.statusCode);
            response.json(result);
            return response;
        } catch (error) {
            throw new DefaultHttpException(error);
        }
    }
}
