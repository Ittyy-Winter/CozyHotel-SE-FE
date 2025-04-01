import { API_ENDPOINTS } from '@/config/api';

export default async function updateUser(userId: string, data: any, token: string) {
  const response = await fetch(
    API_ENDPOINTS.ACCOUNTS.BY_ID(userId),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return await response.json();
}
