import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { loadEnvConfig } from '@next/env';
import pg from 'pg';

const { Pool } = pg;

loadEnvConfig(process.cwd());

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
  return value && value.trim().length > 0 ? value : null;
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error('MISSING_DATABASE_URL');
    process.exitCode = 1;
    return;
  }

  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const appliedResult = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(appliedResult.rows.map((row) => String(row.filename)));

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'UNKNOWN_MIGRATION_ERROR';
  console.error(message);
  process.exitCode = 1;
});
