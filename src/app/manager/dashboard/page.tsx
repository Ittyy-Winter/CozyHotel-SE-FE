'use client'
import { useState } from "react";
import { useSession } from "next-auth/react";
import HotelManagement from "@/components/manager/HotelManagement";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('hotels');
  
  const tabs = [
    { id: 'hotels', label: 'Hotels Management' },
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A55C] mx-auto mb-4"></div>
          <p className="text-[#C9A55C]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to access the manager dashboard</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You do not have manager privileges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-[#C9A55C] mb-6">Manager Dashboard</h1>
        
        

        {/* Dashboard Content */}
        <div className="bg-[#2A2A2A] rounded-lg shadow-xl p-6 border border-[#333333]">
          {activeTab === 'hotels' && (
            <div className="relative">
              <HotelManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
