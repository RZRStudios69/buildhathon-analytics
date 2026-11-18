/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { PoolConfig } from 'pg';

export const postgresConfig = (): PoolConfig => ({
    host                    : process.env.POSTGRES_HOST,
    port                    : parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    database                : process.env.POSTGRES_DB,
    user                    : process.env.POSTGRES_USER,
    password                : process.env.POSTGRES_PASSWORD,
    ssl                     : process.env.POSTGRES_SSL === 'true',
    options                 : `-c search_path=${process.env.POSTGRES_SCHEMA || 'public'}`,
    application_name        : process.env.APP_NAME,
    max                     : parseInt(process.env.POSTGRES_POOL_SIZE, 10) || 10,
    connectionTimeoutMillis : 2000,
    idleTimeoutMillis       : 30000,
    statement_timeout       : 5000,
});
