import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success } from '@/lib/mock-data';

const AI_MODELS = [
  {
    id: 'sam-geo',
    name: 'SAM-Geo',
    version: 'v2.1.0',
    type: 'boundary',
    description: 'Forest plot boundary detection',
    input: 'Satellite imagery',
    output: 'GeoJSON polygons',
  },
  {
    id: 'deepforest',
    name: 'DeepForest',
    version: 'v1.3.0',
    type: 'crown',
    description: 'Individual tree crown detection',
    input: 'RGB imagery',
    output: 'Tree crown polygons',
  },
  {
    id: 'efficientnet',
    name: 'EfficientNet-B4',
    version: 'v1.0.0',
    type: 'species',
    description: 'Tree species classification',
    input: 'Tree crown patches',
    output: 'Species labels + confidence',
  },
];

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  return NextResponse.json(success(AI_MODELS));
}
