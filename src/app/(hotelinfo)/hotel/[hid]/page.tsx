import Image from "next/image";
import getHotel from "@/libs/hotel/getHotel";
import Link from "next/link";

export default async function HotelDetailPage({
  params,
}: {
  params: { hid: string };
}) {
  const hotelDetail = await getHotel(params.hid);

  if (!hotelDetail || !hotelDetail.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="text-2xl font-serif text-[#C9A55C]">Hotel not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-[#C9A55C] mb-6">{hotelDetail.data.name}</h1>
          <div className="w-24 h-[2px] bg-[#C9A55C] mx-auto mb-6"></div>
        </div>
        
        <div className="luxury-card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 relative h-[400px]">
              <Image
                src={hotelDetail.data.picture}
                alt="Hotel Image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-serif text-[#C9A55C] mb-4">Description</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {hotelDetail.data.description}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-serif text-[#C9A55C] mb-4">Location</h2>
                  <p className="text-gray-300">
                    {hotelDetail.data.address}, {hotelDetail.data.district}
                    <br />
                    {hotelDetail.data.province} {hotelDetail.data.postalcode}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-serif text-[#C9A55C] mb-4">Contact</h2>
                  <p className="text-gray-300">{hotelDetail.data.tel}</p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={`/bookings?id=${params.hid}`}
                  className="block w-full"
                >
                  <button className="luxury-button w-full">
                    Make Reservation
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
