"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getUsers from "@/libs/account/getUsers";
import getHotels from "@/libs/hotel/getHotels";
import getBookings from "@/libs/booking/getBookings";
import LoadingSpinner from './LoadingSpinner';

export default function DashboardStats() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
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
      const [usersData, hotelsData, bookingsData] = await Promise.all([
        getUsers(session.user.token),
        getHotels(),
        getBookings(session.user.token)
      ]);

      setStats({
        totalUsers: usersData.count || 0,
        totalHotels: hotelsData.count || 0,
        activeBookings: bookingsData.count || 0,
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
      <div className="bg-[#1A1A1A] border border-[#333333] p-6 rounded-lg hover:bg-[#2A2A2A] transition-colors">
        <h3 className="text-xl font-serif text-[#C9A55C] mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
      </div>
    </div>
  );
}
