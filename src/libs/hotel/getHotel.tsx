import { API_ENDPOINTS } from '@/config/api';

export default async function getHotel(id: string) {
  const response = await fetch(API_ENDPOINTS.HOTELS.BY_ID(id));
  
  if (!response.ok) {
    throw new Error("Failed to fetch Hotel");
  }

  return await response.json();
}
