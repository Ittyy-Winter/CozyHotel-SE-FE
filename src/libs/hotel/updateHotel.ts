import { HotelUpdate } from "@/types";

export default async function editHotel(id: string, data: HotelUpdate, token: string) {
  const response = await fetch(`https://cozyhotel-be.vercel.app/api/v1/hotels/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update hotel");
  }

  return await response.json();
}
