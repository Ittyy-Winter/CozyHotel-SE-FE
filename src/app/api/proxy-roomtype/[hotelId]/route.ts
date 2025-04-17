// app/api/proxy-hotel-booking/[hotelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { hotelId: string } }) {
  const hotelId = params.hotelId;
  const token = req.headers.get('authorization');

  const formattedToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

  console.log("Proxy route token:", token);
  console.log("Formatted token for backend:", formattedToken);

  const res = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/roomtypes/hotel/${hotelId}`, {
    method: 'GET',
    headers: {
      Authorization: formattedToken || '',
    },
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}