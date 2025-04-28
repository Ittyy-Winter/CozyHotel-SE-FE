"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import createBooking from "@/libs/booking/createBooking"; // Make sure this path is correct

// Define the detailed room type interface
type RoomTypeDetails = {
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

// Modify the original RoomType to include roomTypeDetails
type RoomType = {
  _id: string;
  roomTypeId: string;  // Added field to represent roomTypeId
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  isActivated: boolean;
  roomTypeDetails?: RoomTypeDetails;  // This will hold detailed room data
  dailyBookings: Record<string, number>;
  status: string;
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
      if (!hid || !checkin || !checkout) return;
  
      try {
        setIsLoading(true);
  
        // Fetch available room types for the specific hotel and date range
        const availableRes = await fetch(
          `https://cozy-hotel-se-be.vercel.app/api/v1/availability/room-types?hotelId=${hid}&checkInDate=${checkin}&checkOutDate=${checkout}`
        );
        const availableData = await availableRes.json();
  
        if (availableData.success) {
          const availableRoomTypes = availableData.data.availableRoomTypes || [];
  
          // Filter out rooms that are fully booked
          const availableRoomsFiltered = availableRoomTypes.filter((room: RoomType) => room.status !== "fully_booked");
  
          // Now fetch detailed room data for each available room type
          const roomsWithDetails = await Promise.all(
            availableRoomsFiltered.map(async (room: RoomType) => {
              const roomDetailsRes = await fetch(
                `https://cozy-hotel-se-be.vercel.app/api/v1/roomtypes/${room.roomTypeId}`
              );
              const roomDetailsData = await roomDetailsRes.json();
  
              if (roomDetailsData.success) {
                return {
                  ...room,
                  roomTypeDetails: roomDetailsData.data,  // Store the detailed room info
                };
              } else {
                console.error(`Error fetching details for room ${room.roomTypeId}`);
                return room;  // In case of error, just return the basic room info
              }
            })
          );
  
          setRoomTypes(roomsWithDetails);
        } else {
          console.error("Error fetching room types:", availableData);
          setRoomTypes([]); // Clear room types if the request fails
        }
      } catch (err) {
        console.error("Failed to fetch room types:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchRoomTypes();
  }, [hid, checkin, checkout]);

  const handleSelect = async (roomId: string) => {
    // Check if the user is signed in
    if (!session?.user?.token || !session?.user?._id) {
      alert("Please sign in to make a reservation");
      router.push("/api/auth/signin");
      return;
    }
  
    // Check if essential parameters are present
    if (!checkin || !checkout || !hid) {
      console.error("Missing date or hotel information:", { checkin, checkout, hid });
      alert("Missing date or hotel information");
      return;
    }
  
    try {
      // Log the data you're sending to ensure everything is correct
      console.log("Booking data:", {
        hotelId: hid,
        startDate: checkin,
        endDate: checkout,
        user: session.user._id,
        roomType: roomId,
      });
  
      // Call the createBooking function
      const result = await createBooking(
        hid as string,
        {
          startDate: checkin,
          endDate: checkout,
          user: session.user._id,
          roomType: roomId,
        },
        session.user.token
      );
  
      // Check the result and redirect accordingly
      if (result.success) {
        alert("Reservation successful!");
        router.push("/cart"); // Redirect to cart or wherever you want
      } else {
        alert("Failed to make reservation. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating booking:", error.message);
        alert("Failed to make reservation.");
      } else {
        console.error("Unknown error occurred:", error);
        alert("Failed to make reservation.");
      }
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
                    src={room.roomTypeDetails?.images?.[0] || "/fallback-room.jpg"}
                    alt={room.roomTypeDetails?.name || 'Room image'}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between bg-[#1A1A1A]">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#C9A55C] mb-2">{room.roomTypeDetails?.name}</h2>
                    <p className="text-gray-400 text-sm mb-3">{room.roomTypeDetails?.description}</p>
                    <div className="text-sm text-white mb-3">
                      <p>Max Guests: {room.roomTypeDetails?.capacity}</p>
                      <p>Bed Type: {room.roomTypeDetails?.bedType}</p>
                      <p>Room Size: {room.roomTypeDetails?.size}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-white font-semibold">Amenities:</p>
                      <ul className="flex flex-wrap gap-2 mt-1 text-sm text-gray-300">
                        {room.roomTypeDetails?.amenities?.map((item, idx) => (
                          <li key={idx} className="px-2 py-1 bg-gray-800 rounded">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <p className="text-white font-semibold">Facilities:</p>
                      <ul className="flex flex-wrap gap-2 mt-1 text-sm text-gray-300">
                        {room.roomTypeDetails?.facilities?.map((item, idx) => (
                          <li key={idx} className="px-2 py-1 bg-gray-800 rounded">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xl font-bold text-white">
                      ฿{room.roomTypeDetails?.basePrice.toLocaleString()} {room.roomTypeDetails?.currency}
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleSelect(room.roomTypeId)}
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
