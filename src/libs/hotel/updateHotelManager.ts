import { HotelUpdate } from "@/types";

export default async function updateHotelManager(hotelId: string, data: HotelUpdate, token: string) {
  const response = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/manager/hotels/${hotelId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to update hotel:', errorData);
    throw new Error(errorData.message || "Failed to update hotel");
  }

  return await response.json();
}
