// app/api/proxy-hotel-booking/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization');
  const formattedToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

  const res = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/bookings`, {
    headers: {
      Authorization: formattedToken || '',
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
