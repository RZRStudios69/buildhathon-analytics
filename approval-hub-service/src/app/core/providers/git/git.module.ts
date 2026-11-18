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
import { GitService } from 'app/core/providers/git/git.service';

@Module({
    imports: [],
    providers: [GitService],
    exports: [GitService],
})
export class GitServiceModule {}
