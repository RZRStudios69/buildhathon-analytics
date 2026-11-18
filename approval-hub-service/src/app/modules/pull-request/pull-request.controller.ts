/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Controller, Get, Post, Query, Request, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'app/core/decorators/public.decorator';
import { PullRequestService } from 'app/core/services/pull-request/pull-request.service';
import { PullRequestsQueryParam, SyncPullRequestsBody } from 'app/modules/pull-request/pull-request.dto';
import { AppCode } from 'app/core/types/app.types';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';
import { DefaultHttpResponse } from 'app/shared/custom/http-response/default.http-response';

/**
 * Local, login-less deployment: every handler is @Public() and the service binds to 127.0.0.1 only.
 */
@ApiTags('Pull Request')
@Public()
@Controller()
export class PullRequestController {

    /**
     * Constructor
     */
    constructor(
        private readonly _pullRequestService: PullRequestService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @Get('list')
    @ApiOperation({
        summary: 'Get the request board',
        description: 'Returns every synced pull request with its latest decision. Syncs from GitHub first when the board is empty.',
    })
    async getPullRequestList(
        @Request() request,
        @Response() response,
        @Query() query: PullRequestsQueryParam,
    ) {
        try {
            // Step 1: seed the board from GitHub on the very first call so a fresh database is never empty
            const boardPullRequests = await this._pullRequestService.getPullRequestList({});
            if (boardPullRequests.length === 0) {
                await this._pullRequestService.syncPullRequestsFromGithub();
            }

            // Step 2: serve the board, optionally narrowed to one repository
            const pullRequests = await this._pullRequestService.getPullRequestList({ repositoryFullName: query.repositoryFullName });

            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: successCode.code,
                message: successCode.description,
                statusCode: successCode.status,
                data: pullRequests,
            });

            response.status(result.statusCode);
            response.json(result);
            return response;
        } catch (error) {
            throw new DefaultHttpException(error);
        }
    }

    @Post('sync')
    @ApiOperation({
        summary: 'Sync pull requests from GitHub',
        description: 'Fetches the open pull requests of every configured repository and upserts them locally. Read-only against GitHub.',
    })
    async syncPullRequests(
        @Request() request,
        @Response() response,
        @Query() query: SyncPullRequestsBody,
    ) {
        try {
            const syncResult = await this._pullRequestService.syncPullRequestsFromGithub();

            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: 'PULL_REQUESTS_SYNCED',
                message: successCode.description,
                statusCode: successCode.status,
                data: syncResult,
            });

            response.status(result.statusCode);
            response.json(result);
            return response;
        } catch (error) {
            throw new DefaultHttpException(error);
        }
    }
}
