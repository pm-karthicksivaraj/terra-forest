// Temporary diagnostic route — DELETE AFTER DEBUGGING
// Visit: https://terra-forest.vercel.app/api/debug-db
//
// Now tests the EXACT layer where the failure is happening:
//   1. DNS  (already known OK)
//   2. Raw TCP  (already known OK)
//   3. **NEW** Postgres SSLRequest — open TCP, send the 8-byte SSLRequest
//      message (\x00\x00\x00\x08\x04\xd2\x16\x2f), read 1-byte response.
//      Neon should respond with 'S' (0x53) meaning SSL supported.
//      If we get 'S', the Postgres protocol layer is alive.
//   4. **NEW** TLS handshake — wrap the socket in TLS, set SNI = hostname,
//      complete handshake. Reports TLS version, cipher, cert subject.
//   5. Prisma with full error capture (cause chain + stack).

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as dns from 'node:dns/promises';
import * as net from 'node:net';
import * as tls from 'node:tls';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

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
      resolve({ status: 'timeout', elapsed_ms: elapsed, port, message: `TCP timed out after ${timeout}ms` });
    });
    socket.on('error', (err: Error) => {
      const elapsed = Date.now() - start;
      resolve({ status: 'failed', elapsed_ms: elapsed, port, error_name: err.constructor.name, error_message: err.message });
    });
    socket.connect(port, hostname);
  });
}

// Send the 8-byte Postgres SSLRequest message and read the 1-byte response.
// Reference: https://www.postgresql.org/docs/current/protocol-flow.html#id-1.10.5.7.11
//   Bytes: 00 00 00 08  04 d2 16 2f  (length=8, magic=80877103)
async function testPostgresSslRequest(hostname: string, port = 5432) {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 10000;
    socket.setTimeout(timeout);

    // 8-byte SSLRequest message
    const sslRequest = Buffer.from([0x00, 0x00, 0x00, 0x08, 0x04, 0xd2, 0x16, 0x2f]);

    socket.on('connect', () => {
      socket.write(sslRequest);
    });

    socket.on('data', (data: Buffer) => {
      const elapsed = Date.now() - start;
      const byte = data[0];
      const interpretation =
        byte === 0x53 ? 'S = SSL supported (proceed to TLS)' :  // 'S'
        byte === 0x4e ? 'N = SSL not supported' :                // 'N'
        `unknown byte 0x${byte.toString(16)}`;
      socket.destroy();
      resolve({
        status: 'ok',
        elapsed_ms: elapsed,
        response_byte: `0x${byte.toString(16)}`,
        response_char: String.fromCharCode(byte),
        interpretation,
        total_bytes_received: data.length,
      });
    });

    socket.on('timeout', () => {
      const elapsed = Date.now() - start;
      socket.destroy();
      resolve({ status: 'timeout', elapsed_ms: elapsed, message: 'Postgres SSLRequest timed out — server did not respond' });
    });

    socket.on('error', (err: Error) => {
      const elapsed = Date.now() - start;
      resolve({ status: 'failed', elapsed_ms: elapsed, error_name: err.constructor.name, error_message: err.message });
    });

    socket.connect(port, hostname);
  });
}

// Try to perform a full TLS handshake against the Postgres server.
async function testTlsHandshake(hostname: string, port = 5432) {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port,
      servername: hostname, // SNI
      rejectUnauthorized: true,
    });
    const timeout = 10000;
    socket.setTimeout(timeout);

    socket.on('secureConnect', () => {
      const elapsed = Date.now() - start;
      const protocol = socket.getProtocol();
      const cipher = socket.getCipher();
      const cert = socket.getPeerCertificate();
      socket.destroy();
      resolve({
        status: 'ok',
        elapsed_ms: elapsed,
        tls_protocol: protocol,
        cipher: cipher ? cipher.name : null,
        cipher_version: cipher ? cipher.version : null,
        cert_subject: cert ? cert.subject?.CN : null,
        cert_issuer: cert ? cert.issuer?.O : null,
        cert_valid_from: cert ? cert.valid_from : null,
        cert_valid_to: cert ? cert.valid_to : null,
      });
    });

    socket.on('timeout', () => {
      const elapsed = Date.now() - start;
      socket.destroy();
      resolve({ status: 'timeout', elapsed_ms: elapsed, message: `TLS handshake timed out after ${timeout}ms` });
    });

    socket.on('error', (err: Error) => {
      const elapsed = Date.now() - start;
      resolve({ status: 'failed', elapsed_ms: elapsed, error_name: err.constructor.name, error_message: err.message });
    });
  });
}

async function tryPrismaWithFullError(url: string, label: string) {
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
  } catch (err: any) {
    return {
      label,
      url_masked: maskUrl(url),
      status: 'failed',
      error_name: err?.constructor?.name ?? typeof err,
      error_message: err?.message ?? String(err),
      error_code: err?.code ?? null,
      // Prisma often wraps the real cause in err.cause or err.stack
      error_cause: err?.cause
        ? {
            name: err.cause.constructor?.name,
            message: err.cause.message,
            code: err.cause.code,
          }
        : null,
      error_stack: err?.stack ? err.stack.split('\n').slice(0, 8).join('\n') : null,
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

  const savedUrl = rawOriginal;

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: nodeEnv,
      VERCEL_ENV: vercelEnv,
      VERCEL_REGION: vercelRegion,
      NODE_VERSION: process.version,
      RUNTIME: 'nodejs',
    },
    database_url: {
      is_set: !!rawOriginal,
      length: rawOriginal.length,
      masked_value: maskUrl(rawOriginal),
      extracted_hostname: hostname,
      has_pgbouncer: rawOriginal.includes('pgbouncer=true'),
      has_sslmode_require: rawOriginal.includes('sslmode=require'),
      has_channel_binding: rawOriginal.includes('channel_binding=require'),
      has_connect_timeout: rawOriginal.includes('connect_timeout='),
    },
    direct_url: {
      is_set: !!direct,
      masked_value: maskUrl(direct),
    },
  };

  // Test 1: DNS
  diagnostics.dns_test = hostname ? await testDns(hostname) : { status: 'skipped' };

  // Test 2: Raw TCP
  diagnostics.tcp_test = hostname ? await testTcp(hostname, 5432) : { status: 'skipped' };

  // Test 3: Postgres SSLRequest
  diagnostics.postgres_ssl_request_test = hostname
    ? await testPostgresSslRequest(hostname, 5432)
    : { status: 'skipped' };

  // Test 4: Raw TLS handshake (no Postgres protocol — just TLS layer)
  diagnostics.tls_handshake_test = hostname
    ? await testTlsHandshake(hostname, 5432)
    : { status: 'skipped' };

  // Test 5: Prisma with full error capture (single attempt, configured URL)
  const prismaTests: unknown[] = [];
  if (rawOriginal) {
    prismaTests.push(await tryPrismaWithFullError(rawOriginal, 'prisma-configured-url'));
  }
  diagnostics.prisma_tests = prismaTests;

  process.env.DATABASE_URL = savedUrl;

  return NextResponse.json(diagnostics, { status: 200 });
}
