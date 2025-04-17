// app/api/proxy-roomtype/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization');
  const formattedToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const body = await req.json();

  console.log("Proxy POST RoomType token:", token);
  console.log("Formatted token for backend:", formattedToken);

  const res = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/roomtypes`, {
    method: 'POST',
    headers: {
      'Authorization': formattedToken || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}