import { API_ENDPOINTS } from '@/config/api';

export default async function getRoomTypesByHotel(hotelId: string, token: string, page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(
    `${API_ENDPOINTS.ROOMTYPE.BY_ID(hotelId)}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 404) {
    return { data: [], count: 0 };
  }

  if (!response.ok) {
    throw new Error('Failed to fetch room type');
  }

  return await response.json();
}
