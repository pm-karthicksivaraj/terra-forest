// Temporary diagnostic route — DELETE AFTER DEBUGGING
// Visit: https://terra-forest.vercel.app/api/debug-db
//
// Runs THREE tests in order:
//   1. DNS resolution of the Neon hostname
//   2. Raw TCP connection to host:5432 (bypasses Prisma/TLS)
//   3. Prisma connection test (real DB query)
//
// All values are masked — safe to share output.

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as dns from 'node:dns/promises';
import * as net from 'node:net';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function maskUrl(url: string): string {
  if (!url) return '(empty)';
  try {
    return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1****$2');
  } catch {
    return '(unparseable)';
  }
}

function extractHost(url: string): string | null {
  try {
    const m = url.match(/@([^:/?#]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function testDns(hostname: string) {
  const start = Date.now();
  try {
    const records = await dns.resolve4(hostname);
    return {
      status: 'ok',
      elapsed_ms: Date.now() - start,
      addresses: records,
    };
  } catch (err: unknown) {
    return {
      status: 'failed',
      elapsed_ms: Date.now() - start,
      error_name: err instanceof Error ? err.constructor.name : typeof err,
      error_message: err instanceof Error ? err.message : String(err),
    };
  }
}

async function testTcp(hostname: string, port: number) {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 10000; // 10s

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const elapsed = Date.now() - start;
      socket.destroy();
      resolve({ status: 'ok', elapsed_ms: elapsed, port });
    });

    socket.on('timeout', () => {
      const elapsed = Date.now() - start;
      socket.destroy();
      resolve({
        status: 'timeout',
        elapsed_ms: elapsed,
        port,
        message: `TCP connect timed out after ${timeout}ms`,
      });
    });

    socket.on('error', (err: Error) => {
      const elapsed = Date.now() - start;
      resolve({
        status: 'failed',
        elapsed_ms: elapsed,
        port,
        error_name: err.constructor.name,
        error_message: err.message,
      });
    });

    socket.connect(port, hostname);
  });
}

export async function GET() {
  const raw = process.env.DATABASE_URL ?? '';
  const direct = process.env.DIRECT_URL ?? '';
  const nodeEnv = process.env.NODE_ENV ?? '(unset)';
  const vercelEnv = process.env.VERCEL_ENV ?? '(not on vercel)';
  const vercelRegion = process.env.VERCEL_REGION ?? '(unknown)';
  const hostname = extractHost(raw);

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
      extracted_hostname: hostname,
    },
    direct_url: {
      is_set: !!direct,
      length: direct.length,
      masked_value: maskUrl(direct),
    },
  };

  // ─── Test 1: DNS resolution ────────────────────────────────────────────
  let dnsTest: unknown = { status: 'skipped', reason: 'no hostname extracted' };
  if (hostname) {
    dnsTest = await testDns(hostname);
  }
  diagnostics.dns_test = dnsTest;

  // ─── Test 2: Raw TCP connection (no Prisma, no TLS) ────────────────────
  let tcpTest: unknown = { status: 'skipped', reason: 'no hostname extracted' };
  if (hostname) {
    tcpTest = await testTcp(hostname, 5432);
  }
  diagnostics.tcp_test = tcpTest;

  // ─── Test 3: Full Prisma connection ────────────────────────────────────
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
  diagnostics.prisma_connection_test = connectionTest;

  return NextResponse.json(diagnostics, { status: 200 });
}
