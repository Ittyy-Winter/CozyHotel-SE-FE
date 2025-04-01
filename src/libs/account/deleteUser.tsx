import { API_ENDPOINTS } from '@/config/api';

export default async function deleteUser(userId: string, token: string) {
  const response = await fetch(
    API_ENDPOINTS.ACCOUNTS.BY_ID(userId),
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return await response.json();
}
