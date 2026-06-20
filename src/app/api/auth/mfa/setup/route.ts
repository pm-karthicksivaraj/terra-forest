import { NextResponse } from 'next/server';

export async function GET() {
  // Mock MFA setup data - returns QR code URL and secret
  const secret = 'JBSWY3DPEHPK3PXP';
  const qrUrl = `otpauth://totp/TerraForest:admin@terraforest.vn?secret=${secret}&issuer=TerraForest&algorithm=SHA1&digits=6&period=30`;

  return NextResponse.json({
    data: {
      qr_url: qrUrl,
      secret: secret,
    },
  });
}
