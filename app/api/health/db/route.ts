import { NextResponse } from 'next/server';

import { getDatabaseUrl, query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!getDatabaseUrl()) {
    return NextResponse.json(
      { ok: false, db: false, error: 'MISSING_DATABASE_URL' },
      { status: 503 }
    );
  }

  try {
    await query<{ ok: number }>('SELECT 1 as ok');
    return NextResponse.json({ ok: true, db: true });
  } catch {
    return NextResponse.json({ ok: false, db: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
  }
}
