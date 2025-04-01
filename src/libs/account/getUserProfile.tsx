import { API_ENDPOINTS } from '@/config/api';

export default async function getUserProfile(token: string) {
  const response = await fetch(
    API_ENDPOINTS.AUTH.ME,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
}
