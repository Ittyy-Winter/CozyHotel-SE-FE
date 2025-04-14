export default async function createBooking(
  hotelId: string,
  bookingData: {
    startDate: string;
    endDate: string;
    user: string;
    roomType: string;
  },
  token: string
) {
  if (!token) {
    throw new Error("Authentication required");
  }

  const requestBody = {
    hotel: hotelId,
    checkinDate: bookingData.startDate,
    checkoutDate: bookingData.endDate,
    user: bookingData.user,
    roomType: bookingData.roomType,
  };

  const isDev = process.env.NODE_ENV === "development";

  const requestUrl = isDev
    ? `/api/proxy-hotel-booking/${hotelId}`
    : `https://cozy-hotel-se-be.vercel.app/api/v1/hotels/${hotelId}/bookings`;

  console.log("Request URL:", requestUrl);
  console.log("Request Body:", requestBody);
  console.log("Token:", token);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

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
