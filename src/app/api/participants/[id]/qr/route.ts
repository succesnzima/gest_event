import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const participant =
    await prisma.participant.findUnique({
      where: {
        id,
      },
    });

  if (
    !participant ||
    !participant.qrToken
  ) {
    return NextResponse.json(
      {
        error: 'QR indisponible',
      },
      {
        status: 404,
      }
    );
  }

  const qrUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/checkin/${participant.qrToken}`;

  const qrDataUrl =
    await QRCode.toDataURL(qrUrl);

  return NextResponse.json({
    qrDataUrl,
    qrUrl,
  });
}