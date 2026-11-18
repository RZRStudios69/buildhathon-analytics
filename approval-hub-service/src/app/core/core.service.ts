/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

const REQUIRED_ENVIRONMENT = ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'JWT_SECRET', 'GITHUB_REPOSITORIES'];
const MINIMUM_SECRET_LENGTH = 32;

@Injectable()
export class CoreService implements OnApplicationBootstrap {

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    onApplicationBootstrap() {
        this.ensureEnvironment();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Stop the boot when a required key is missing. The message names the keys, never their values.
     * A .env file is optional: in a container the keys come from `environment:`.
     */
    private ensureEnvironment() {
        const missingKeys = REQUIRED_ENVIRONMENT.filter((environmentKey) => !process.env[environmentKey]?.trim());
        if (missingKeys.length > 0) {
            throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
        }

        if (process.env.JWT_SECRET.length < MINIMUM_SECRET_LENGTH) {
            throw new Error(`JWT_SECRET must be at least ${MINIMUM_SECRET_LENGTH} characters`);
        }

        const configuredRepositories = this.parseConfiguredRepositories();
        if (configuredRepositories.length === 0) {
            throw new Error('GITHUB_REPOSITORIES must list at least one owner/name entry');
        }
    }

    /**
     * GITHUB_REPOSITORIES is a comma-separated list of owner/name entries; blanks are dropped
     */
    private parseConfiguredRepositories(): string[] {
        return (process.env.GITHUB_REPOSITORIES ?? '')
            .split(',')
            .map((configuredRepository) => configuredRepository.trim())
            .filter(Boolean);
    }
}
