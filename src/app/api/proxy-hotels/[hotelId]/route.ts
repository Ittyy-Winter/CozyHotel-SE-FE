// app/api/proxy-hotel/[hotelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { hotelId: string } }) {
  const hotelId = params.hotelId;
  const token = req.headers.get('authorization');

  // ✅ Ensure correct Bearer token format
  const formattedToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

  console.log("Proxy route token:", token);
  console.log("Formatted token for backend:", formattedToken);

  try {
    // Make the request to the backend API to fetch hotel details by ID
    const res = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/hotels/${hotelId}`, {
      method: 'GET',
      headers: {
        Authorization: formattedToken || '',
      },
    });

    // If response is not OK, throw an error
    if (!res.ok) {
      throw new Error(`Failed to fetch hotel with ID: ${hotelId}`);
    }

    // Parse the response data
    const data = await res.json();

    // Return the response data to the client
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {  // Cast the error as `any`
    console.error("Error in proxy route:", error);
    // Return a 500 error if something goes wrong
    return NextResponse.json({ error: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}
