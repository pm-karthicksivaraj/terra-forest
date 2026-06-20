// Temporary verification route — DELETE AFTER DEBUGGING
// Visit: https://terra-forest.vercel.app/api/debug-db
//
// Confirms the Prisma + Neon adapter setup is working end-to-end on Vercel.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  const t0 = Date.now();
  try {
    const userCount = await db.user.count();
    const sampleUsers = await db.user.findMany({
      select: { id: true, email: true, name: true, is_active: true },
      take: 3,
    });
    return NextResponse.json({
      status: 'ok',
      elapsed_ms: Date.now() - t0,
      runtime_info: {
        NODE_VERSION: process.version,
        VERCEL_ENV: process.env.VERCEL_ENV ?? null,
        VERCEL_REGION: process.env.VERCEL_REGION ?? null,
        USE_NEON_ADAPTER_ACTIVE:
          process.env.VERCEL_ENV === 'production' ||
          process.env.VERCEL_ENV === 'preview' ||
          process.env.USE_NEON_ADAPTER === 'true',
      },
      user_count: userCount,
      sample_users: sampleUsers,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'failed',
      elapsed_ms: Date.now() - t0,
      error_name: err?.constructor?.name,
      error_message: err?.message,
      error_cause: err?.cause?.message ?? null,
    }, { status: 500 });
  }
}
