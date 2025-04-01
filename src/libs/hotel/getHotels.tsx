import { API_ENDPOINTS } from '@/config/api';

export default async function getHotels(page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(`${API_ENDPOINTS.HOTELS.BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Hotels");
  }

  return await response.json();
}
