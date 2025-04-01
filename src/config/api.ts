// API base URL configuration
export const API_BASE_URL = 'https://cozyhotel-be.vercel.app';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
  },
  // Hotels
  HOTELS: {
    BASE: `${API_BASE_URL}/api/v1/hotels`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/hotels/${id}`,
    BOOKINGS: (hotelId: string) => `${API_BASE_URL}/api/v1/hotels/${hotelId}/bookings`,
  },
  // Accounts
  ACCOUNTS: {
    BASE: `${API_BASE_URL}/api/v1/accounts`,
    BY_ID: (userId: string) => `${API_BASE_URL}/api/v1/accounts/${userId}`,
  },
  // Bookings
  BOOKINGS: {
    BASE: `${API_BASE_URL}/api/v1/bookings`,
    BY_ID: (bookingId: string) => `${API_BASE_URL}/api/v1/bookings/${bookingId}`,
  },
}; 