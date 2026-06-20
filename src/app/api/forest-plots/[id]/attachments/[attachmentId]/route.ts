import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success } from '@/lib/mock-data';

// Shared attachment store (in production this would be a database)
const attachments: Array<{
  id: number;
  plot_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  uploaded_by: string;
  created_at: string;
}> = [
  { id: 1, plot_id: 1, filename: 'sentinel2_2024_q3.tif', file_type: 'image/tiff', file_size: 45200000, url: '/storage/attachments/sentinel2_2024_q3.tif', uploaded_by: 'Terra Admin', created_at: '2024-09-01T08:00:00Z' },
  { id: 2, plot_id: 1, filename: 'field_survey_2024.pdf', file_type: 'application/pdf', file_size: 3200000, url: '/storage/attachments/field_survey_2024.pdf', uploaded_by: 'NLU Researcher', created_at: '2024-08-15T10:00:00Z' },
  { id: 3, plot_id: 3, filename: 'lidar_scan_2024.las', file_type: 'application/octet-stream', file_size: 128000000, url: '/storage/attachments/lidar_scan_2024.las', uploaded_by: 'NLU Researcher', created_at: '2024-07-20T14:00:00Z' },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id, attachmentId } = await params;
  const attachment = attachments.find(a => a.plot_id === parseInt(id) && a.id === parseInt(attachmentId));

  if (!attachment) return NextResponse.json({ message: 'Attachment not found' }, { status: 404 });

  return NextResponse.json(success(attachment));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id, attachmentId } = await params;
  const idx = attachments.findIndex(a => a.plot_id === parseInt(id) && a.id === parseInt(attachmentId));

  if (idx === -1) return NextResponse.json({ message: 'Attachment not found' }, { status: 404 });

  attachments.splice(idx, 1);
  return NextResponse.json({ success: true });
}
