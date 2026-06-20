import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, CARBON_RECORDS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const verified = CARBON_RECORDS.filter(r => r.status === 'verified').length;
  const pending = CARBON_RECORDS.filter(r => r.status === 'pending').length;
  const needsReview = CARBON_RECORDS.filter(r => r.status === 'needs_review').length;
  const totalStock = CARBON_RECORDS.reduce((s, r) => s + r.carbon_stock_tonnes, 0);
  const avgConfidence = CARBON_RECORDS.reduce((s, r) => s + r.confidence, 0) / CARBON_RECORDS.length;

  const byYear: Record<number, number> = {};
  CARBON_RECORDS.forEach(r => {
    byYear[r.recorded_year] = (byYear[r.recorded_year] || 0) + r.carbon_stock_tonnes;
  });
  const byYearArr = Object.entries(byYear).map(([year, total_stock]) => ({ year: parseInt(year), total_stock }));

  return NextResponse.json(success({
    total_carbon_stock: totalStock,
    verified_records: verified,
    pending_records: pending,
    needs_review_records: needsReview,
    avg_confidence: Math.round(avgConfidence * 100) / 100,
    by_year: byYearArr,
  }));
}
