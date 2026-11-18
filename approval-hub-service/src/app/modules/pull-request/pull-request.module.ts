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
import { PullRequestServiceModule } from 'app/core/services/pull-request/pull-request.module';
import { PullRequestController } from 'app/modules/pull-request/pull-request.controller';

@Module({
    imports: [PullRequestServiceModule],
    controllers: [PullRequestController],
})
export class PullRequestModule {}
