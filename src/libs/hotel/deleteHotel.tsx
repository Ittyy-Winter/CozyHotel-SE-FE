import { API_ENDPOINTS } from '@/config/api';

export default async function deleteHotel(id: string, token: string) {
    if (!token) {
        throw new Error("Authentication required");
    }

    const response = await fetch(
        API_ENDPOINTS.HOTELS.BY_ID(id),
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        console.error('Response Status:', response.status);

        let errorMessage;
        try {
            // Try to parse the error as JSON
            const errorJson = JSON.parse(errorData);
            errorMessage = errorJson.message || errorJson.error || errorData;
        } catch {
            // If not JSON, use the raw error text
            errorMessage = errorData;
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}