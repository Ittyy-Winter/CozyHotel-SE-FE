"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import getUsers from "@/libs/account/getUsers";
import deleteUser from "@/libs/account/deleteUser";
import { User, Hotel } from "@/types";
import LoadingSpinner from './LoadingSpinner';
import SearchBar from '../SearchBar';
import { API_ENDPOINTS } from '@/config/api';
import getHotels from '@/libs/hotel/getHotels';
import CustomSelect from "@/components/CustomSelect";

export default function AccountManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAddManagerSuccessMessage, setShowAddManagerSuccessMessage] = useState(false);
  const [isAddingManager, setIsAddingManager] = useState(false);
  const [isEditRoleManager, setIsEditingRoleManager] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [pendingRoleChangeUserId, setPendingRoleChangeUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const response = await getHotels(1, 1000);
        setHotels(response.data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    }

    fetchHotels();
  }, []);

  useEffect(() => {
    if (session?.user?.token) {
      fetchAllUsers();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.token && !searchTerm) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [session, currentPage, searchTerm]);

  const fetchAllUsers = async () => {
    if (!session?.user?.token) return;
    try {
      setLoading(true);
      const response = await getUsers(session.user.token, 1, 1000);
      setAllUsers(response.data);
      setTotalItems(response.count);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all users:", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!session?.user?.token) return;
    try {
      setLoading(true);
      const response = await getUsers(session.user.token, currentPage, itemsPerPage);
      setUsers(response.data);
      setTotalItems(response.count);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!session?.user?.token) return;

    if (newRole === 'manager') {
      setPendingRoleChangeUserId(userId)
      setIsEditingRoleManager(true);
      return;
    }

    try {
      await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/accounts/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole, managedHotels: [] }),
      });

      // Refresh both filtered and all users
      await fetchUsers();
      await fetchAllUsers();

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!session?.user?.token) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId, session.user.token);
        // Refresh both filtered and all users
        await fetchUsers();
        await fetchAllUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleCancelAddManager = () => {
    setIsAddingManager(false);
    setName('');
    setPassword('');
    setEmail('');
    setTel('');
    setSelectedHotels([]);
  };

  const handleCancelEditRoleManager = () => {
    setIsEditingRoleManager(false);
    setSelectedHotels([]);
  };

  const handleSubmitEditRoleManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;
    try {
      setIsEditingRoleManager(false);
      
      await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/accounts/${pendingRoleChangeUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'manager',
          managedHotels: selectedHotels,
        }),
      });

      setPendingRoleChangeUserId(null);

      await fetchUsers();
      await fetchAllUsers();

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setSelectedHotels([]);
    } catch (error) {
      console.error('Error update manager:', error);
      alert('Failed to update manager. Please try again.');
    }
  };


  const handleSubmitAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;
    try {
      setIsAddingManager(false);
      setName('');
      setPassword('');
      setEmail('');
      setTel('');
      setSelectedHotels([]);

      console.log(selectedHotels)

      await fetch(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            tel: tel,
            role: 'manager',
            managedHotels: selectedHotels
          }),
        }
      );

      // Refresh both filtered and all users
      await fetchUsers();
      await fetchAllUsers();

      // Show success message
      setShowAddManagerSuccessMessage(true);
      setTimeout(() => setShowAddManagerSuccessMessage(false), 3000);
    } catch (error) {
      console.log('Error add manager:', error);
      alert('Failed to add manager. Please try again.');
    }
  };

  const Pagination = ({ totalItems, currentPage, onPageChange }: {
    totalItems: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push(-1);
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push(-1);
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push(-1);
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push(-1);
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-serif text-sm
            ${currentPage === 1
              ? 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed'
              : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333] transition-colors'}`}
        >
          Previous
        </button>

        {getPageNumbers().map((pageNum, idx) => (
          pageNum === -1 ? (
            <span key={`ellipsis-${idx}`} className="text-gray-500">...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-serif text-sm
                ${currentPage === pageNum
                  ? 'bg-[#C9A55C] text-white'
                  : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333] transition-colors'}`}
            >
              {pageNum}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
          className={`px-4 py-2 rounded-lg font-serif text-sm
            ${currentPage === Math.ceil(totalItems / itemsPerPage)
              ? 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed'
              : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333] transition-colors'}`}
        >
          Next
        </button>
      </div>
    );
  };

  const filteredUsers = searchTerm
    ? allUsers
      .filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.tel?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) // 🛠️ เพิ่มแบ่งหน้า
    : users;

  const totalFilteredItems = searchTerm
    ? allUsers.filter(user =>
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.tel?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ).length
    : totalItems;



  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session?.user?.token) {
    return <p>Please sign in to manage accounts</p>;
  }

  return (
    <div>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-900/20 border border-green-500 text-green-500 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>User role updated successfully!</span>
        </div>
      )}

      {/* Success Add Manager Message */}
      {showAddManagerSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-900/20 border border-green-500 text-green-500 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Add manager successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <h2 className="text-2xl font-serif text-[#C9A55C] mb-6">User Accounts</h2>
        </div>
        {/* Add Hotel Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddingManager(true)}
            className="mb-6 px-4 py-2 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
          hover:bg-[#C9A55C] hover:text-white transition-colors"
          >
            Add New Manager
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search users by name, email, phone, or role..."
          value={searchTerm}
        />
      </div>

      <div className="grid gap-4 mb-8">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user: any) => (
            <div
              key={user._id}
              className="border border-[#333333] rounded-lg p-4 flex justify-between items-center bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
            >
              <div>
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-400">Tel: {user.tel}</p>
                <p className="text-xs text-[#C9A55C]">Role: {user.role}</p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(user.createAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRoleChange(user._id, "admin")}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded hover:bg-[#C9A55C] hover:text-white transition-colors"
                  disabled={user.role === "admin"}
                >
                  Make Admin
                </button>
                <button
                  onClick={() => handleRoleChange(user._id, "manager")}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded hover:bg-[#C9A55C] hover:text-white transition-colors"
                  disabled={user.role === "manager"}
                >
                  Make Manager
                </button>
                <button
                  onClick={() => handleRoleChange(user._id, "user")}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded hover:bg-[#C9A55C] hover:text-white transition-colors"
                  disabled={user.role === "user"}
                >
                  Make User
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Only show pagination if there are users and we're not searching */}
      {filteredUsers.length > 0 && (
        <Pagination
          totalItems={totalFilteredItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}


      {isAddingManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl overflow-y-auto max-h-screen bg-[#1A1A1A] rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-serif text-[#C9A55C]">Add Manager</h3>
              <button
                onClick={handleCancelAddManager}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmitAddManager}
              className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    onChange={(event) => { setName(event.target.value) }}
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Email</label>
                  <input
                    type='email'
                    placeholder="Enter your email"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    onChange={(event) => { setEmail(event.target.value) }}
                    required
                  />
                </div>
                {/* Password */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    onChange={(event) => { setPassword(event.target.value) }}
                    required
                  />
                </div>
                {/* Phone number */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    onChange={(event) => { setTel(event.target.value) }}
                    required
                  />
                </div>

                {/* Select2 Hotel */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Select Hotel</label>
                  <div style={{ paddingBottom: "150px" }}>
                    <CustomSelect
                      hotels={hotels.map(hotel => ({
                        value: hotel._id,
                        label: hotel.name
                      }))}
                      selectedHotels={selectedHotels}
                      onChange={(selected) => setSelectedHotels(selected)}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelAddManager}
                  className="rounded border border-[#C9A55C] bg-[#2A2A2A] px-4 py-2 text-[#C9A55C] transition-colors hover:bg-[#C9A55C] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 rounded bg-[#C9A55C] px-4 py-2 text-white transition-colors hover:bg-[#B38B4A] disabled:opacity-50"
                >
                  Add Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditRoleManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl overflow-y-auto max-h-screen bg-[#1A1A1A] rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-serif text-[#C9A55C]">Select Hotels Managed by This Manager</h3>
              <button
                onClick={handleCancelEditRoleManager}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmitEditRoleManager}
              className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Select2 Hotel */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Select Hotel</label>
                  <div style={{ paddingBottom: "250px" }}>
                    <CustomSelect
                      hotels={hotels.map(hotel => ({
                        value: hotel._id,
                        label: hotel.name
                      }))}
                      selectedHotels={selectedHotels}
                      onChange={(selected) => setSelectedHotels(selected)}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEditRoleManager}
                  className="rounded border border-[#C9A55C] bg-[#2A2A2A] px-4 py-2 text-[#C9A55C] transition-colors hover:bg-[#C9A55C] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 rounded bg-[#C9A55C] px-4 py-2 text-white transition-colors hover:bg-[#B38B4A] disabled:opacity-50"
                >
                  Add Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
