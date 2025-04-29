import { Booking } from '@/types';

export interface BookingUpdateData {
  checkinDate: string; // format: "YYYY-MM-DD"
  checkoutDate: string;
}

export default async function updateBookingManager(
  bookingId: string,
  data: BookingUpdateData,
  token: string
): Promise<Booking> {
  const response = await fetch(
    `https://cozy-hotel-se-be.vercel.app/api/v1/manager/bookings/${bookingId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to update booking:', errorData);
    throw new Error(errorData.message || 'Failed to update booking');
  }

  return response.json();
}
