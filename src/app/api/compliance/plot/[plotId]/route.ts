import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, CARBON_RECORDS, success } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plotId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { plotId } = await params;
  const plot = PLOTS.find(p => p.id === parseInt(plotId));
  if (!plot) return NextResponse.json({ message: 'Plot not found' }, { status: 404 });

  const plotCarbons = CARBON_RECORDS.filter(r => r.plot_id === plot.id);
  const hasVerified = plotCarbons.some(r => r.status === 'verified');
  const metaPass = plot.metadata_completeness >= 70;
  const lineagePass = !!plot.metadata_lineage && plot.metadata_lineage.length > 10;

  return NextResponse.json(success({
    plot_code: plot.plot_code,
    plot_id: plot.id,
    plot_status: plot.status,
    verification_status: hasVerified && metaPass && lineagePass ? 'compliant' : 'non_compliant',
    all_checks_pass: metaPass && lineagePass && hasVerified,
    checks: {
      metadata: { passed: metaPass, label: 'Metadata Completeness', details: `${plot.metadata_completeness}% complete (threshold: 70%)` },
      lineage: { passed: lineagePass, label: 'Lineage Documentation', details: lineagePass ? 'Lineage documented' : 'Lineage missing or insufficient' },
      carbon: { passed: hasVerified, label: 'Carbon Verification', details: hasVerified ? 'At least one verified carbon record' : 'No verified carbon records' },
    },
  }));
}
