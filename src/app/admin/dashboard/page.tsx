'use client'
import { useState } from "react";
import { useSession } from "next-auth/react";
import HotelManagement from "@/components/admin/HotelManagement";
import AccountManagement from "@/components/admin/AccountManagement";
import DashboardStats from "@/components/admin/DashboardStats";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'hotels', label: 'Hotels Management' },
    { id: 'accounts', label: 'User Accounts' },
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
          <p>Please sign in to access the admin dashboard</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You do not have admin privileges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-[#C9A55C] mb-6">Admin Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-serif ${
                activeTab === tab.id
                  ? 'bg-[#C9A55C] text-white'
                  : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="bg-[#2A2A2A] rounded-lg shadow-xl p-6 border border-[#333333]">
          {activeTab === 'overview' && (
            <div className="relative">
              <DashboardStats />
            </div>
          )}
          {activeTab === 'hotels' && (
            <div className="relative">
              <HotelManagement />
            </div>
          )}
          {activeTab === 'accounts' && (
            <div className="relative">
              <AccountManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
