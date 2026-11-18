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
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { appRoutes } from 'app.routes';
import { throttlerConfig } from 'app/config/throttler.config';
import { CoreService } from 'app/core/core.service';
import { LogServiceModule } from 'app/core/providers/log/log.module';
import { AuditModule } from 'app/modules/audit/audit.module';
import { DecisionModule } from 'app/modules/decision/decision.module';
import { HealthModule } from 'app/modules/health/health.module';
import { MilestoneModule } from 'app/modules/milestone/milestone.module';
import { PullRequestModule } from 'app/modules/pull-request/pull-request.module';

@Module({
    imports: [
        ConfigModule.forRoot({ expandVariables: true }),
        ThrottlerModule.forRootAsync({ useFactory: throttlerConfig }),
        LogServiceModule,
        // Custom modules
        HealthModule,
        PullRequestModule,
        DecisionModule,
        AuditModule,
        MilestoneModule,
        // Router modules
        RouterModule.register(appRoutes),
    ],
    providers: [
        CoreService,
        // Every route is rate-limited; the service is local and login-less, so every handler is marked @Public()
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
