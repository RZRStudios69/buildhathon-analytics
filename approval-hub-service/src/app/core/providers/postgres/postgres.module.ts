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
import { PostgresService } from 'app/core/providers/postgres/postgres.service';

@Module({
    imports: [],
    providers: [PostgresService],
    exports: [PostgresService],
})
export class PostgresServiceModule {}
