// app/api/proxy-hotel-manager/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://cozy-hotel-se-be.vercel.app/api/v1/manager/hotels';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Forward Authorization header if needed (optional)
    const authHeader = req.headers.get('authorization') || '';

    const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader, // pass the Bearer token if exists
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // to avoid caching issues
    });

    if (!res.ok) {
      console.error('Failed to fetch from backend:', res.statusText);
      return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in proxy-hotel-manager:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
