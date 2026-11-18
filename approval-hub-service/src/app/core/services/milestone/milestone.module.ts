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
import { MilestoneService } from 'app/core/services/milestone/milestone.service';

@Module({
    imports: [LogServiceModule, PostgresServiceModule, GithubServiceModule],
    providers: [MilestoneService],
    exports: [MilestoneService],
})
export class MilestoneServiceModule {}
