import { API_ENDPOINTS } from '@/config/api';

export default async function getAvailableRoomTypes(
  hotelId: string,
  checkInDate: string,
  checkOutDate: string,
  token: string
) {
  const params = new URLSearchParams();
  params.append('hotelId', hotelId);
  params.append('checkInDate', checkInDate);
  params.append('checkOutDate', checkOutDate);

  const response = await fetch(
    `${API_ENDPOINTS.AVAILABILITY.ROOM_TYPES}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 404) {
    return { data: null };
  }

  if (!response.ok) {
    throw new Error('Failed to fetch available room types');
  }

  return await response.json();
}
