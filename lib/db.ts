import 'server-only';

import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getDatabaseUrl(): string | null {
  const value = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
  return value && value.trim().length > 0 ? value : null;
}

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error('MISSING_DATABASE_URL');
  }

  pool = new Pool({ connectionString });
  return pool;
}

export async function query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  const clientPool = getPool();
  return clientPool.query<T>(text, params as unknown[] | undefined);
}
