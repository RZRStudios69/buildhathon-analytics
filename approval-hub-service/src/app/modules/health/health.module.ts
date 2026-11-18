/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { Module } from '@nestjs/common';
import { PostgresServiceModule } from 'app/core/providers/postgres/postgres.module';
import { HealthController } from 'app/modules/health/health.controller';

@Module({
    imports: [PostgresServiceModule],
    controllers: [HealthController],
})
export class HealthModule {}
