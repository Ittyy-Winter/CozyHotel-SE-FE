import { API_ENDPOINTS } from '@/config/api';

export default async function userRegister(
  userName: string,
  userEmail: string,
  userPassword: string,
  userTel: string
) {
  try {
    console.log(`Registering user: ${userName}, ${userEmail}`);

    const response = await fetch(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          tel: userTel,
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      
      return {
        success: false,
        message: data.message || "Registration Failed beacuse of duplicate email or wrong input",
        data
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }
}
