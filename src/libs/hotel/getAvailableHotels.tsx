import { API_ENDPOINTS } from '@/config/api';

export default async function getAvailableHotels(checkInDate: string, checkOutDate: string) {
  const params = new URLSearchParams();
  params.append('checkInDate', checkInDate);
  params.append('checkOutDate', checkOutDate);

  const response = await fetch(`${API_ENDPOINTS.AVAILABILITY.HOTELS}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch available hotels');
  }

  const data = await response.json();
  return data;
}
