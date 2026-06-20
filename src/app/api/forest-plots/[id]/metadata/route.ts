import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, success } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id } = await params;
  const plot = PLOTS.find(p => p.id === parseInt(id));
  if (!plot) return NextResponse.json({ message: 'Plot not found' }, { status: 404 });

  const metadata = {
    metadata_completeness: plot.metadata_completeness,
    citation: `Terra Forest Monitoring System. ${plot.metadata_title}. ${new Date().getFullYear()}.`,
    reference_system: 'VN-2000 / UTM zone 48N (EPSG:3408)',
    lineage: plot.metadata_lineage,
    data_quality: plot.metadata_completeness > 70 ? 'high' : plot.metadata_completeness > 40 ? 'medium' : 'low',
    source_imagery: 'Sentinel-2 L2A, PlanetScope',
    update_frequency: 'quarterly',
  };

  return NextResponse.json(success(metadata));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id } = await params;
  const plot = PLOTS.find(p => p.id === parseInt(id));
  if (!plot) return NextResponse.json({ message: 'Plot not found' }, { status: 404 });

  try {
    const body = await request.json();
    if (body.citation) plot.metadata_lineage = body.citation;
    if (body.lineage) plot.metadata_lineage = body.lineage;
    if (body.data_quality) plot.metadata_completeness = body.data_quality === 'high' ? 85 : body.data_quality === 'medium' ? 55 : 25;
    plot.updated_at = new Date().toISOString();

    return NextResponse.json(success({
      metadata_completeness: plot.metadata_completeness,
      citation: body.citation || `Terra Forest Monitoring System. ${plot.metadata_title}.`,
      reference_system: 'VN-2000 / UTM zone 48N (EPSG:3408)',
      lineage: plot.metadata_lineage,
      data_quality: body.data_quality || 'medium',
      source_imagery: 'Sentinel-2 L2A, PlanetScope',
      update_frequency: 'quarterly',
    }));
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
}
