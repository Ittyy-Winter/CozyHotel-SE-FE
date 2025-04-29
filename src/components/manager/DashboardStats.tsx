"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getManagerHotels from "@/libs/hotel/getManagerHotels";
import getBookingsManager from "@/libs/booking/getBookingsManager";
import LoadingSpinner from './LoadingSpinner';

export default function DashboardStats() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHotels: 0,
    activeBookings: 0,
  });

  useEffect(() => {
    if (!session?.user?.token) return;
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    if (!session?.user?.token) return;
    try {
      const hotelsData = await getManagerHotels(session.user.token);
      console.log('HOTELS DATA:', hotelsData);
      const hotels = hotelsData.data || [];
  
      const bookingsPromises = hotels.map((hotel: { id: string, _id: string }) =>
        getBookingsManager(hotel._id || hotel.id, session.user.token)
      );
  
      const bookingsResults = await Promise.all(bookingsPromises);
      console.log('Bookings Results:', bookingsResults);
  
      // Now we simply count all bookings, no filtering
      const totalBookings = bookingsResults.reduce((acc, bookingsData) => {
        if (!bookingsData.data) return acc;
        return acc + bookingsData.data.length;
      }, 0);
  
      console.log("Total Bookings: ", totalBookings);
  
      setStats({
        totalHotels: hotels.length,
        activeBookings: totalBookings, // you can rename `activeBookings` to `totalBookings` if you want
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <div>Please sign in to view stats</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg hover:bg-[#2A2A2A] transition-colors">
        <h3 className="text-xl font-serif text-[#C9A55C] mb-2">Total Hotels</h3>
        <p className="text-3xl font-bold text-white">{stats.totalHotels}</p>
      </div>
      <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg hover:bg-[#2A2A2A] transition-colors">
        <h3 className="text-xl font-serif text-[#C9A55C] mb-2">Active Bookings</h3>
        <p className="text-3xl font-bold text-white">{stats.activeBookings}</p>
      </div>
    </div>
  );
}
