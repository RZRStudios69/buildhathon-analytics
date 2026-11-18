/**
 * Forward-only migration runner: applies seed/NNN-<verb>-<noun>.sql in filename order,
 * skipping files already recorded in the migrations table.
 *
 * Usage: npm run migrate
 */

const { Client } = require('pg');
const { readdirSync, readFileSync } = require('fs');
const { join } = require('path');

const SEED_DIRECTORY = join(__dirname);

async function bootstrap() {
    const client = new Client({
        host        : process.env.POSTGRES_HOST || '127.0.0.1',
        port        : parseInt(process.env.POSTGRES_PORT, 10) || 5432,
        database    : process.env.POSTGRES_DB,
        user        : process.env.POSTGRES_USER,
        password    : process.env.POSTGRES_PASSWORD,
    });

    await client.connect();

    // Step 1: the bookkeeping table
    await client.query(`CREATE TABLE IF NOT EXISTS migrations (
        file_name   VARCHAR(200) PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    // Step 2: every file not yet applied, in filename order
    const appliedResult = await client.query('SELECT file_name FROM migrations');
    const appliedFileNames = new Set(appliedResult.rows.map((appliedRow) => appliedRow.file_name));

    const seedFileNames = readdirSync(SEED_DIRECTORY)
        .filter((seedFileName) => /^\d{3}-.*\.sql$/.test(seedFileName))
        .sort();

    for (const seedFileName of seedFileNames) {
        if (appliedFileNames.has(seedFileName)) {
            continue;
        }

        const seedSql = readFileSync(join(SEED_DIRECTORY, seedFileName), 'utf-8');
        console.log(`Applying ${seedFileName} ...`);
        await client.query('BEGIN');
        try {
            await client.query(seedSql);
            await client.query('INSERT INTO migrations (file_name) VALUES ($1)', [seedFileName]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        console.log(`Applied  ${seedFileName}`);
    }

    await client.end();
    console.log('Migrations up to date.');
}

bootstrap().catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
});
