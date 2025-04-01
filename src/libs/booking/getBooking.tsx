export default async function getBooking(id:string, token:string) {
    const response = await fetch(`https://cozyhotel-be.vercel.app/api/v1/bookings/${id}`, {
        cache: 'no-store',
        headers: {
            authorization: `Bearer ${token}`,
        }
    })
    if(!response.ok){
        throw new Error('Failed to fetch booking')
    }

    return await response.json()
}