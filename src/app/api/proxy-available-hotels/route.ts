import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');

  if (!checkInDate || !checkOutDate) {
    return NextResponse.json({ error: "Missing checkInDate or checkOutDate" }, { status: 400 });
  }

  const targetUrl = `https://cozy-hotel-se-be.vercel.app/api/v1/availability/hotels?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;

  const response = await fetch(targetUrl);
  const data = await response.json();

  return NextResponse.json(data);
}
