import { API_ENDPOINTS } from '@/config/api';

export default async function userLogIn(
  userEmail: string,
  userPassword: string
) {
  try {
    console.log(`Logging in user: ${userEmail}`);

    const response = await fetch(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
