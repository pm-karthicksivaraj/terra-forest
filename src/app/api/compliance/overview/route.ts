import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, CARBON_RECORDS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const plots = PLOTS.map(p => {
    const plotCarbons = CARBON_RECORDS.filter(r => r.plot_id === p.id);
    const hasVerified = plotCarbons.some(r => r.status === 'verified');
    return {
      plot_id: p.id,
      plot_code: p.plot_code,
      plot_status: p.status,
      metadata_complete: p.metadata_completeness >= 70,
      lineage_confirmed: !!p.metadata_lineage && p.metadata_lineage.length > 10,
      carbon_verified: hasVerified,
      all_checks_pass: p.metadata_completeness >= 70 && !!p.metadata_lineage && p.metadata_lineage.length > 10 && hasVerified,
    };
  });

  const metadataComplete = plots.filter(p => p.metadata_complete).length;
  const lineageConfirmed = plots.filter(p => p.lineage_confirmed).length;
  const carbonVerified = plots.filter(p => p.carbon_verified).length;
  const fullyCompliant = plots.filter(p => p.all_checks_pass).length;

  return NextResponse.json(success({
    summary: {
      total_plots: PLOTS.length,
      metadata_complete: metadataComplete,
      lineage_confirmed: lineageConfirmed,
      carbon_verified: carbonVerified,
      fully_compliant: fullyCompliant,
    },
    plots,
  }));
}
