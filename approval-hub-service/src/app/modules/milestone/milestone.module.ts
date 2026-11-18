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
import { MilestoneServiceModule } from 'app/core/services/milestone/milestone.module';
import { MilestoneController } from 'app/modules/milestone/milestone.controller';

@Module({
    imports: [MilestoneServiceModule],
    controllers: [MilestoneController],
})
export class MilestoneModule {}
