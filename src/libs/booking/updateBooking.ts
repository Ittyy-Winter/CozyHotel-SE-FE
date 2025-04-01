interface UpdateBookingParams {
  checkinDate: string;
  checkoutDate: string;
}

export default async function updateBooking(
  bookingId: string,
  token: string,
  bookingData: UpdateBookingParams
) {
  const response = await fetch(`https://cozyhotel-be.vercel.app/api/v1/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData)
  });

  if (!response.ok) {
      throw new Error('Failed to update booking');
  }

  return await response.json();
}