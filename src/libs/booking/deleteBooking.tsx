export default async function deleteBooking(bookingId: string, token: string) {
    const response = await fetch(`https://cozyhotel-be.vercel.app/api/v1/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
            'authorization': `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete booking');
    }

    return await response.json();
} 