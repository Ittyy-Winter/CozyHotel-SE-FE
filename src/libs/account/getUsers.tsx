import { API_ENDPOINTS } from '@/config/api';

export default async function getUsers(token: string, page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(
    `${API_ENDPOINTS.ACCOUNTS.BASE}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error("Cannot get users");
  }

  return await response.json();
}
