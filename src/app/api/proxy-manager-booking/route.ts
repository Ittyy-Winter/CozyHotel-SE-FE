// app/api/proxy-manager-booking/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://cozy-hotel-se-be.vercel.app/api/v1/manager/hotels'; // Hardcoded backend URL

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    if (!hotelId) {
      return NextResponse.json({ error: 'Missing hotelId' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization') || '';

    const res = await fetch(`${API_URL}/${hotelId}/bookings?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Important: avoid caching issues
    });

    if (!res.ok) {
      console.error('Failed to fetch bookings from backend:', res.statusText);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in proxy-manager-booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
