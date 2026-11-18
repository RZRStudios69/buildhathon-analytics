/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Body, Controller, HttpStatus, Post, Request, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'app/core/decorators/public.decorator';
import { AuditService } from 'app/core/services/audit/audit.service';
import { DecisionService } from 'app/core/services/decision/decision.service';
import { PullRequestService } from 'app/core/services/pull-request/pull-request.service';
import { DecisionStatus } from 'app/core/services/pull-request/pull-request.types';
import { CreateDecisionBody } from 'app/modules/decision/decision.dto';
import { GitService, LocalMergeConflictError } from 'app/core/providers/git/git.service';
import { AppCode } from 'app/core/types/app.types';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';
import { DefaultHttpResponse } from 'app/shared/custom/http-response/default.http-response';

const DECIDED_BY = 'local-reviewer';

/**
 * Local, login-less deployment: every handler is @Public() and the service binds to 127.0.0.1 only.
 */
@ApiTags('Decision')
@Public()
@Controller()
export class DecisionController {

    /**
     * Constructor
     */
    constructor(
        private readonly _decisionService: DecisionService,
        private readonly _auditService: AuditService,
        private readonly _pullRequestService: PullRequestService,
        private readonly _gitService: GitService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @Post()
    @ApiOperation({
        summary: 'Record a decision',
        description: 'Approving merges the pull request into its base branch in the local git mirror before the decision is recorded; rejecting only records the decision. Nothing is pushed to any remote.',
    })
    async createDecision(
        @Request() request,
        @Response() response,
        @Body() body: CreateDecisionBody,
    ) {
        try {
            const { repositoryFullName, pullRequestNumber, status, reviewNote } = body;

            // Step 1: find the pull request so the merge and the audit entry know its refs and title
            const pullRequest = await this._pullRequestService.getPullRequest({ repositoryFullName, pullRequestNumber });
            if (!pullRequest) {
                const failedCode = AppCode.NOT_FOUND;
                throw new DefaultHttpException({
                    message: 'Pull request not found',
                    code: failedCode.code,
                    statusCode: failedCode.status,
                    error: { reason: 'PULL_REQUEST_NOT_SYNCED' },
                    module: DecisionController.name,
                });
            }

            // Step 2: approving performs the local merge first; a conflict or a missing base branch stops the request and records nothing
            let localMergeResult = null;
            if (status === DecisionStatus.APPROVED) {
                try {
                    localMergeResult = await this._gitService.mergePullRequestLocally({
                        repositoryFullName,
                        pullRequestNumber,
                        headRefName: pullRequest.headRefName,
                        baseRefName: pullRequest.baseRefName,
                    });
                } catch (mergeError) {
                    if (mergeError instanceof LocalMergeConflictError) {
                        throw new DefaultHttpException({
                            message: 'Merge failed: the pull request conflicts with the base branch. Resolve the conflict before approving.',
                            statusCode: HttpStatus.CONFLICT,
                            code: 'MERGE_CONFLICT',
                            error: { reason: 'LOCAL_MERGE_CONFLICT' },
                            module: DecisionController.name,
                        });
                    }
                    throw new DefaultHttpException({
                        message: 'Merge failed: the pull request branches are not available in the local mirror (base branch may not exist locally).',
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                        code: 'MERGE_UNAVAILABLE',
                        error: { reason: 'LOCAL_MERGE_UNAVAILABLE' },
                        module: DecisionController.name,
                    });
                }
            }

            // Step 3: record the decision itself
            const decision = await this._decisionService.createDecision({
                repositoryFullName,
                pullRequestNumber,
                status,
                reviewNote,
                decidedBy: DECIDED_BY,
            });

            // Step 4: the audit entry is written only after the decision succeeded
            await this._auditService.createAuditEntry({
                action: status === DecisionStatus.APPROVED ? 'approved' : 'rejected',
                repositoryFullName,
                pullRequestNumber,
                pullRequestTitle: pullRequest.title,
                reviewNote,
                performedBy: DECIDED_BY,
            });

            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: 'DECISION_RECORDED',
                message: successCode.description,
                statusCode: successCode.status,
                data: { decision, localMergeResult },
            });

            response.status(result.statusCode);
            response.json(result);
            return response;
        } catch (error) {
            if (error instanceof LocalMergeConflictError) {
                throw new DefaultHttpException({
                    message: 'Merge failed: the pull request conflicts with the base branch. Resolve the conflict before approving.',
                    statusCode: HttpStatus.CONFLICT,
                    code: 'MERGE_CONFLICT',
                    error: { reason: 'LOCAL_MERGE_CONFLICT' },
                    module: DecisionController.name,
                });
            }
            throw new DefaultHttpException(error);
        }
    }
}
