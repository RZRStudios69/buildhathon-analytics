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
import { GithubServiceModule } from 'app/core/providers/github/github.module';
import { LogServiceModule } from 'app/core/providers/log/log.module';
import { PostgresServiceModule } from 'app/core/providers/postgres/postgres.module';
import { PullRequestService } from 'app/core/services/pull-request/pull-request.service';

@Module({
    imports: [LogServiceModule, PostgresServiceModule, GithubServiceModule],
    providers: [PullRequestService],
    exports: [PullRequestService],
})
export class PullRequestServiceModule {}
