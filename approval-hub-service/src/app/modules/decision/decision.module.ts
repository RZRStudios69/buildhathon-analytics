/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Module } from '@nestjs/common';
import { GitServiceModule } from 'app/core/providers/git/git.module';
import { AuditServiceModule } from 'app/core/services/audit/audit.module';
import { DecisionServiceModule } from 'app/core/services/decision/decision.module';
import { PullRequestServiceModule } from 'app/core/services/pull-request/pull-request.module';
import { DecisionController } from 'app/modules/decision/decision.controller';

@Module({
    imports: [DecisionServiceModule, AuditServiceModule, PullRequestServiceModule, GitServiceModule],
    controllers: [DecisionController],
})
export class DecisionModule {}
