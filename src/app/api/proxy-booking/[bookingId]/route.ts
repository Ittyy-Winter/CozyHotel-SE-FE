import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const { bookingId } = params;
  const token = req.headers.get("authorization");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://cozy-hotel-se-be.vercel.app/api/v1/bookings/${bookingId}`,
      {
        method: "GET",
        headers: {
          Authorization: formattedToken || "",
        },
      }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error fetching booking by ID:", error);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
}
