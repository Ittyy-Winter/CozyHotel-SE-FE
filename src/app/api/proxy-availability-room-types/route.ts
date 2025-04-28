// app/api/proxy-availability-room-types/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const hotelId = searchParams.get("hotelId");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");

  const token = req.headers.get("authorization");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  if (!hotelId || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      { success: false, message: "Missing hotelId, checkInDate or checkOutDate" },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await fetch(
      `https://cozy-hotel-se-be.vercel.app/api/v1/availability/room-types?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: formattedToken || "",
        },
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Proxy error fetching available room types:", error);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
}
