"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import createBooking from "@/libs/booking/createBooking"; // Make sure this path is correct

type RoomType = {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  bedType: string;
  size: string;
  amenities: string[];
  facilities: string[];
  images: string[];
  basePrice: number;
  currency: string;
  hotelId: string;
};

export default function SelectRoomPage() {
  const { hid } = useParams();
  const searchParams = useSearchParams();
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchRoomTypes = async () => {
      if (!hid) return;

      try {
        const res = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/roomtypes/hotel/${hid}`);
        const data = await res.json();
        setRoomTypes(data.data || []);
      } catch (err) {
        console.error("Failed to fetch room types", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomTypes();
  }, [hid]);

  const handleSelect = async (roomId: string) => {
    if (!session?.user?.token || !session?.user?._id) {
      alert("Please sign in to make a reservation");
      router.push("/api/auth/signin");
      return;
    }

    if (!checkin || !checkout || !hid) {
      alert("Missing date or hotel information");
      return;
    }

    try {
      await createBooking(
        hid as string,
        {
          startDate: checkin,
          endDate: checkout,
          user: session.user._id,
          roomType: roomId,
        },
        session.user.token
      );

      alert("Reservation successful!");
      router.push("/cart"); // or wherever you want to redirect
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to make reservation.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif mb-8 text-[#C9A55C]">Select Room Type</h1>

        {isLoading ? (
          <div className="text-center py-20">Loading room types...</div>
        ) : (
          <div className="space-y-8">
            {roomTypes.map((room) => (
              <div
                key={room._id}
                className="flex flex-col md:flex-row border border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="relative w-full md:w-1/3 h-64">
                  <Image
                    src={room.images?.[0] || "/fallback-room.jpg"}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between bg-[#1A1A1A]">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#C9A55C] mb-2">{room.name}</h2>
                    <p className="text-gray-400 text-sm mb-3">{room.description}</p>
                    <div className="text-sm text-white mb-3">
                      <p>Max Guests: {room.capacity}</p>
                      <p>Bed Type: {room.bedType}</p>
                      <p>Room Size: {room.size}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-white font-semibold">Amenities:</p>
                      <ul className="flex flex-wrap gap-2 mt-1 text-sm text-gray-300">
                        {room.amenities.map((item, idx) => (
                          <li key={idx} className="px-2 py-1 bg-gray-800 rounded">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <p className="text-white font-semibold">Facilities:</p>
                      <ul className="flex flex-wrap gap-2 mt-1 text-sm text-gray-300">
                        {room.facilities.map((item, idx) => (
                          <li key={idx} className="px-2 py-1 bg-gray-800 rounded">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xl font-bold text-white">
                      ฿{room.basePrice.toLocaleString()} {room.currency}
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleSelect(room._id)}
                      className="inline-block bg-[#C9A55C] text-black px-5 py-2 rounded-md font-semibold hover:opacity-90 transition"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
