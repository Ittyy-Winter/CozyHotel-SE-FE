import { API_ENDPOINTS } from '@/config/api';

export default async function createHotel(
  hotelData: {
    name: string;
    address: string;
    district: string;
    province: string;
    postalcode: string;
    tel?: string;
    picture: string;
    description: string;
  },
  token: string
) {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    API_ENDPOINTS.HOTELS.BASE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(hotelData),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error("API Error Response:", errorData);
    console.error("Response Status:", response.status);

    let errorMessage;
    try {
      const errorJson = JSON.parse(errorData);
      errorMessage = errorJson.message || errorJson.error || errorData;
    } catch {
      errorMessage = errorData;
    }

    throw new Error(errorMessage);
  }

  return await response.json();
}
