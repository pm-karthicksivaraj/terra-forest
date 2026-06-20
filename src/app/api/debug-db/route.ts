// Temporary diagnostic route — DELETE AFTER DEBUGGING
// Visit: https://terra-forest.vercel.app/api/debug-db
//
// Hypotheses being tested (in order):
//   H1 — Neon cold-start timeout: Neon free tier suspends idle compute. Wake-up
//        can take 5-30s, but Prisma's default connect_timeout is 5s. Fix: add
//        &connect_timeout=30 to the URL. We test this by retrying the same URL
//        back-to-back — if attempt #2 or #3 succeeds after #1 wakes Neon, this
//        confirms cold-start.
//   H2 — Pooler endpoint broken: Neon's -pooler hostname sometimes silently
//        drops Postgres startup packets. The non-pooler (direct) hostname may
//        work. We test by swapping to the DIRECT_URL.
//   H3 — Connect timeout too low: We test the configured URL with
//        &connect_timeout=30 appended to see if a longer timeout helps.

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as dns from 'node:dns/promises';
import * as net from 'node:net';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // give us headroom for retry logic

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
    const timeout = 10000;

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

async function tryPrismaWithUrl(url: string, label: string) {
  let prisma: PrismaClient | null = null;
  try {
    process.env.DATABASE_URL = url;
    prisma = new PrismaClient({ log: ['error', 'warn'] });
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 AS ok, current_database() AS db_name`;
    const elapsed = Date.now() - start;
    return {
      label,
      url_masked: maskUrl(url),
      status: 'ok',
      elapsed_ms: elapsed,
      result,
    };
  } catch (err: unknown) {
    return {
      label,
      url_masked: maskUrl(url),
      status: 'failed',
      error_name: err instanceof Error ? err.constructor.name : typeof err,
      error_message: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (prisma) {
      try { await prisma.$disconnect(); } catch {}
    }
  }
}

function appendParam(url: string, param: string): string {
  // Appends a query param to a URL, handling existing ? and & correctly.
  if (url.includes('?')) {
    return `${url}&${param}`;
  }
  return `${url}?${param}`;
}

function swapToDirect(url: string): string | null {
  // Swaps the -pooler hostname to the non-pooler (direct) hostname.
  // Returns null if the URL doesn't use a -pooler endpoint.
  try {
    const u = new URL(url);
    if (!u.hostname.includes('-pooler')) return null;
    const directHost = u.hostname.replace('-pooler', '');
    u.hostname = directHost;
    // Drop pgbouncer=true from direct URL — direct endpoint doesn't use PgBouncer
    const params = new URLSearchParams(u.search);
    params.delete('pgbouncer');
    u.search = params.toString();
    return u.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  const rawOriginal = process.env.DATABASE_URL ?? '';
  const direct = process.env.DIRECT_URL ?? '';
  const nodeEnv = process.env.NODE_ENV ?? '(unset)';
  const vercelEnv = process.env.VERCEL_ENV ?? '(not on vercel)';
  const vercelRegion = process.env.VERCEL_REGION ?? '(unknown)';
  const hostname = extractHost(rawOriginal);

  const savedUrl = rawOriginal;

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: nodeEnv,
      VERCEL_ENV: vercelEnv,
      VERCEL_REGION: vercelRegion,
    },
    database_url: {
      is_set: !!rawOriginal,
      length: rawOriginal.length,
      starts_with_postgres_protocol:
        rawOriginal.startsWith('postgresql://') || rawOriginal.startsWith('postgres://'),
      has_pgbouncer: rawOriginal.includes('pgbouncer=true'),
      has_sslmode_require: rawOriginal.includes('sslmode=require'),
      has_channel_binding: rawOriginal.includes('channel_binding=require'),
      has_connect_timeout: rawOriginal.includes('connect_timeout='),
      has_trailing_whitespace: rawOriginal !== rawOriginal.trim(),
      has_trailing_newline: rawOriginal.endsWith('\n') || rawOriginal.endsWith('\r'),
      masked_value: maskUrl(rawOriginal),
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

  // ─── Test 2: Raw TCP connection ────────────────────────────────────────
  let tcpTest: unknown = { status: 'skipped', reason: 'no hostname extracted' };
  if (hostname) {
    tcpTest = await testTcp(hostname, 5432);
  }
  diagnostics.tcp_test = tcpTest;

  const prismaTests: unknown[] = [];

  // ─── H1: Cold-start retry test ─────────────────────────────────────────
  // If Neon compute is asleep, attempt #1 will fail (timeout during wake-up),
  // but attempt #2 or #3 (run immediately after, while compute is now awake)
  // should succeed. This is the smoking gun for cold-start.
  if (rawOriginal) {
    prismaTests.push(await tryPrismaWithUrl(rawOriginal, 'cold-start-retry-1-of-3'));
    prismaTests.push(await tryPrismaWithUrl(rawOriginal, 'cold-start-retry-2-of-3'));
    prismaTests.push(await tryPrismaWithUrl(rawOriginal, 'cold-start-retry-3-of-3'));
  }

  // ─── H3: Add connect_timeout=30 ────────────────────────────────────────
  // If the URL doesn't already have connect_timeout, append it and retry.
  if (rawOriginal && !rawOriginal.includes('connect_timeout=')) {
    const withTimeout = appendParam(rawOriginal, 'connect_timeout=30');
    prismaTests.push(await tryPrismaWithUrl(withTimeout, 'with-connect_timeout-30'));
  }

  // ─── H2: Use the DIRECT_URL (non-pooler) endpoint ──────────────────────
  // Neon's pooler sometimes silently fails. The direct endpoint often works.
  if (direct) {
    // Strip channel_binding from direct URL for cleanest test
    const cleanDirect = direct
      .replace(/&channel_binding=require/g, '')
      .replace(/channel_binding=require&?/g, '');
    prismaTests.push(await tryPrismaWithUrl(cleanDirect, 'direct-endpoint'));
  }

  // Also try swapping pooler → direct on DATABASE_URL itself
  if (rawOriginal) {
    const swapped = swapToDirect(rawOriginal);
    if (swapped) {
      prismaTests.push(await tryPrismaWithUrl(swapped, 'database-url-swapped-to-direct'));
    }
  }

  diagnostics.prisma_tests = prismaTests;

  process.env.DATABASE_URL = savedUrl;

  return NextResponse.json(diagnostics, { status: 200 });
}
