/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Routes } from '@nestjs/core';
import { AuditModule } from 'app/modules/audit/audit.module';
import { DecisionModule } from 'app/modules/decision/decision.module';
import { HealthModule } from 'app/modules/health/health.module';
import { MilestoneModule } from 'app/modules/milestone/milestone.module';
import { PullRequestModule } from 'app/modules/pull-request/pull-request.module';

export const appRoutes: Routes = [
    {
        path: 'api',
        children: [
            { path: 'health', module: HealthModule },
            { path: 'pull-request', module: PullRequestModule },
            { path: 'decision', module: DecisionModule },
            { path: 'audit', module: AuditModule },
            { path: 'milestone', module: MilestoneModule },
        ],
    },
];
