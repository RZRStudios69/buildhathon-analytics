/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { postgresConfig } from 'app/config/postgres.config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(PostgresService.name);
    private readonly config = postgresConfig();
    private readonly pool = new Pool(this.config);

    /**
     * Constructor
     */
    constructor() {
        // An idle client that loses its connection emits 'error'. Without a listener the process crashes.
        this.pool.on('error', (error) => {
            this.logger.error(`Idle Postgres client error (${error.name})`);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    async onModuleInit() {
        const isConnected = await this.testConnection();
        if (isConnected) {
            this.logger.log(`Postgres database ${this.config.database} successfully initialized`);
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Every value goes in `binds` ($1, $2, ...). Never put a value into the query text.
     */
    async query<T = any>(query: string, binds: any[] = []): Promise<{ rows?: T[]; rowCount?: number }> {
        try {
            const result = await this.pool.query(query, binds);
            return {
                rows: result.rows as T[],
                rowCount: result.rowCount,
            };
        } catch (error) {
            // Log the error code only: the query text and binds carry user data
            this.logger.error(`Postgres query failed (${error?.code ?? error?.name})`);
            throw error;
        }
    }

    /**
     * Runs `work` on one client inside BEGIN / COMMIT, rolls back on any error and always releases the client.
     */
    async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await work(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.pool.query('SELECT 1');
            return true;
        } catch (error) {
            this.logger.error(`Postgres connection test failed (${error?.code ?? error?.name})`);
            return false;
        }
    }
}
