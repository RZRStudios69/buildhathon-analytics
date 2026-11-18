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
import { AuditServiceModule } from 'app/core/services/audit/audit.module';
import { AuditController } from 'app/modules/audit/audit.controller';

@Module({
    imports: [AuditServiceModule],
    controllers: [AuditController],
})
export class AuditModule {}
