import { API_ENDPOINTS } from '@/config/api';

export default async function getBookingsManager(
  hotelId: string,
  token: string,
  page?: number,
  limit?: number
) {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (limit !== undefined) params.append('limit', limit.toString());

  const url = `${API_ENDPOINTS.MANAGER.BOOKINGS(hotelId)}`;
  const fullUrl = params.toString() ? `${url}?${params.toString()}` : url; // <-- fixed here!

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Fetch failed:', errorText);
    throw new Error('Failed to fetch bookings');
  }

  const result = await response.json();
  console.log('Bookings API Response:', result);

  return result;
}
