import { Booking } from '@/types';

export default async function editBooking(
  bookingId: string,
  data: {
    checkinDate: Date;
    checkoutDate: Date;
  },
  token: string
): Promise<Booking> {
  const response = await fetch(
    `https://cozyhotel-be.vercel.app/api/v1/bookings/${bookingId}`,
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
    throw new Error('Failed to update booking');
  }

  return response.json();
} 