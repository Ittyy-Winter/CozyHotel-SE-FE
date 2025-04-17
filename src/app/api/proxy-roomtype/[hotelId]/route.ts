// app/api/proxy-roomtype/[hotelId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  const hotelId = params.hotelId;
  const token = req.headers.get("authorization");

  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  console.log("Proxy GET RoomType token:", token);
  console.log("Formatted token for backend:", formattedToken);

  const page = req.nextUrl.searchParams.get("page") || "1";
  const limit = req.nextUrl.searchParams.get("limit") || "10";

  const backendUrl = `https://cozy-hotel-se-be.vercel.app/api/v1/roomtypes/hotel/${hotelId}?page=${page}&limit=${limit}`;

  const res = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: formattedToken || "",
    },
  });

  if (res.status === 404) {
    return NextResponse.json({ data: [], count: 0 }, { status: 200 });
  }

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
