/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GithubService } from 'app/core/providers/github/github.service';

@Module({
    imports: [HttpModule],
    providers: [GithubService],
    exports: [GithubService],
})
export class GithubServiceModule {}
