// API base URL configuration
// export const API_BASE_URL = 'https://cozy-hotel-se-be.vercel.app/';
export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "" // Use proxy route in development
    : "https://cozy-hotel-se-be.vercel.app";

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN:
      process.env.NODE_ENV === "development"
        ? "/api/proxy-auth-login"
        : `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER:
      process.env.NODE_ENV === "development"
        ? "/api/proxy-auth-register"
        : `${API_BASE_URL}/api/v1/auth/register`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
  },
  // Hotels
  // HOTELS: {
  //   BASE: `${API_BASE_URL}/api/v1/hotels`,
  //   BY_ID: (id: string) => `${API_BASE_URL}/api/v1/hotels/${id}`,
  //   BOOKINGS: (hotelId: string) => `${API_BASE_URL}/api/v1/hotels/${hotelId}/bookings`,
  // },
  HOTELS: {
    BASE:
      process.env.NODE_ENV === "development"
        ? "/api/proxy-hotels"
        : `${API_BASE_URL}/api/v1/hotels`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/hotels/${id}`,
    BOOKINGS: (hotelId: string) =>
      process.env.NODE_ENV === "development"
        ? `/api/proxy-hotel-booking/${hotelId}`
        : `${API_BASE_URL}/api/v1/hotels/${hotelId}/bookings`,
  },
  // Accounts
  ACCOUNTS: {
    BASE:
      process.env.NODE_ENV === "development"
        ? "/api/proxy-users"
        : `${API_BASE_URL}/api/v1/accounts`,
    BY_ID: (userId: string) => `${API_BASE_URL}/api/v1/accounts/${userId}`,
  },
  // Bookings
  BOOKINGS: {
    BASE:
      process.env.NODE_ENV === "development"
        ? "/api/proxy-hotel-booking"
        : `${API_BASE_URL}/api/v1/bookings`,
    BY_HOTEL: (hotelId: string) =>
      process.env.NODE_ENV === "development"
        ? `/api/proxy-hotel-booking/${hotelId}`
        : `${API_BASE_URL}/api/v1/hotels/${hotelId}/bookings`,
  },
};
