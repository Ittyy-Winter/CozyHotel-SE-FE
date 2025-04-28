import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  const searchParams = req.nextUrl.searchParams.toString();

  const url = `https://cozy-hotel-se-be.vercel.app/api/v1/accounts${
    searchParams ? `?${searchParams}` : ""
  }`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: formattedToken || "",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
