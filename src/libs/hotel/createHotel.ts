import { HotelUpdate } from "@/types";

export default async function createHotel(data: HotelUpdate, token: string) {
  const response = await fetch("https://cozyhotel-be.vercel.app/api/v1/hotels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create hotel");
  }

  return await response.json();
}
