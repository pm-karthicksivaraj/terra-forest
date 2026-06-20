// Temporary diagnostic route — DELETE AFTER DEBUGGING
// Visit: https://terra-forest.vercel.app/api/debug-db
//
// Runs sequential tests to isolate the Vercel→Neon connection failure:
//   1. DNS resolution
//   2. Raw TCP connection (bypasses Prisma/TLS)
//   3. Prisma connection with the CURRENT DATABASE_URL (as configured)
//   4. Prisma connection with channel_binding STRIPPED from URL
//   5. Prisma connection with a clean minimal URL
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
    // Override env var for this PrismaClient instance
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

export async function GET() {
  const rawOriginal = process.env.DATABASE_URL ?? '';
  const direct = process.env.DIRECT_URL ?? '';
  const nodeEnv = process.env.NODE_ENV ?? '(unset)';
  const vercelEnv = process.env.VERCEL_ENV ?? '(not on vercel)';
  const vercelRegion = process.env.VERCEL_REGION ?? '(unknown)';
  const hostname = extractHost(rawOriginal);

  // Save original to restore later
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

  // ─── Tests 3-5: Try Prisma with different URL variants ────────────────
  const prismaTests: unknown[] = [];

  // Test 3: As-configured (with channel_binding if present)
  if (rawOriginal) {
    prismaTests.push(await tryPrismaWithUrl(rawOriginal, 'as-configured'));
  }

  // Test 4: Strip channel_binding from URL
  if (rawOriginal && rawOriginal.includes('channel_binding=require')) {
    const stripped = rawOriginal
      .replace(/&channel_binding=require/g, '')
      .replace(/channel_binding=require&?/g, '');
    prismaTests.push(await tryPrismaWithUrl(stripped, 'without-channel_binding'));
  }

  // Test 5: Minimal URL — only sslmode=require
  if (rawOriginal) {
    try {
      const u = new URL(rawOriginal);
      const minimal = `postgresql://${u.username}:${u.password}@${u.hostname}${u.pathname}?sslmode=require`;
      prismaTests.push(await tryPrismaWithUrl(minimal, 'minimal-sslmode-only'));
    } catch {}
  }

  diagnostics.prisma_tests = prismaTests;

  // Restore original env var
  process.env.DATABASE_URL = savedUrl;

  return NextResponse.json(diagnostics, { status: 200 });
}
