import { API_ENDPOINTS } from '@/config/api';

export default async function getBookings(token: string, page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS.BASE}?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                authorization: `Bearer ${token}`,
            },
        }
    );

    console.log(response)
    if(!response.ok){
        throw new Error('Failed to fetch bookings')
    }

    return await response.json()
}