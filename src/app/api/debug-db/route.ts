// Temporary diagnostic route — DELETE AFTER DEBUGGING
// Visit: https://terra-forest.vercel.app/api/debug-db
//
// This route prints what Vercel actually sees for DATABASE_URL and tries
// a minimal DB ping. It masks the password so it's safe to share output.

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function maskUrl(url: string): string {
  if (!url) return '(empty)';
  try {
    // Mask the password portion only
    return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1****$2');
  } catch {
    return '(unparseable)';
  }
}

export async function GET() {
  const raw = process.env.DATABASE_URL ?? '';
  const direct = process.env.DIRECT_URL ?? '';
  const nodeEnv = process.env.NODE_ENV ?? '(unset)';
  const vercelEnv = process.env.VERCEL_ENV ?? '(not on vercel)';
  const vercelRegion = process.env.VERCEL_REGION ?? '(unknown)';

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: nodeEnv,
      VERCEL_ENV: vercelEnv,
      VERCEL_REGION: vercelRegion,
    },
    database_url: {
      is_set: !!raw,
      length: raw.length,
      starts_with_postgres_protocol:
        raw.startsWith('postgresql://') || raw.startsWith('postgres://'),
      has_pgbouncer: raw.includes('pgbouncer=true'),
      has_sslmode_require: raw.includes('sslmode=require'),
      has_channel_binding: raw.includes('channel_binding=require'),
      has_trailing_whitespace: raw !== raw.trim(),
      has_trailing_newline: raw.endsWith('\n') || raw.endsWith('\r'),
      masked_value: maskUrl(raw),
    },
    direct_url: {
      is_set: !!direct,
      length: direct.length,
      masked_value: maskUrl(direct),
    },
  };

  // Try to actually connect
  let connectionTest: Record<string, unknown>;
  let prisma: PrismaClient | null = null;
  try {
    if (!raw) {
      connectionTest = { status: 'skipped', reason: 'DATABASE_URL not set' };
    } else {
      prisma = new PrismaClient({ log: ['error', 'warn'] });
      const start = Date.now();
      const result = await prisma.$queryRaw`SELECT 1 AS ok, NOW() AS server_time, current_database() AS db_name`;
      const elapsed = Date.now() - start;
      connectionTest = {
        status: 'ok',
        elapsed_ms: elapsed,
        result: result,
      };
    }
  } catch (err: unknown) {
    connectionTest = {
      status: 'failed',
      error_name: err instanceof Error ? err.constructor.name : typeof err,
      error_message: err instanceof Error ? err.message : String(err),
      error_stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5).join('\n') : null,
    };
  } finally {
    if (prisma) {
      try { await prisma.$disconnect(); } catch {}
    }
  }

  diagnostics.connection_test = connectionTest;

  return NextResponse.json(diagnostics, { status: 200 });
}
