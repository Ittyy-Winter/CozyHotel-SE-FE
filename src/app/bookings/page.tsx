"use client";
import DateReserve from "@/components/DateReserve";
import dayjs, { Dayjs } from "dayjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import createBooking from "@/libs/booking/createBooking";
import getBookings from '@/libs/booking/getBookings';
import { Booking } from '@/types';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

export default function Reservations() {
  const urlParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const cid = urlParams.get("id");
  const [hotelName, setHotelName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; // Match backend pagination

  // Admin search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDateRange, setSearchDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null
  });
  const [sortField, setSortField] = useState<'checkinDate' | 'checkoutDate' | 'createdAt'>('checkinDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchBookingId, setSearchBookingId] = useState('');

  useEffect(() => {
    const fetchHotelName = async () => {
      if (cid) {
        try {
          console.log("Fetching hotel with ID:", cid);
          const response = await fetch(
            `https://cozyhotel-be.vercel.app/api/v1/hotels/${cid}`
          );
          console.log("Response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("Received data:", data);
            if (data && data.data && data.data.name) {
              setHotelName(data.data.name);
              console.log("Set hotel name to:", data.data.name);
            } else {
              console.error("No name found in response data");
            }
          } else {
            console.error("Failed to fetch hotel:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching hotel name:", error);
        }
      } else {
        console.log("No hotel ID provided");
      }
    };

    fetchHotelName();
  }, [cid]);

  useEffect(() => {
    console.log("hotelName changed to:", hotelName);
  }, [hotelName]);

  useEffect(() => {
    const initializePage = async () => {
      if (!session?.user?.token) {
        setLoading(false);
        return;
      }
      await fetchBookings();
    };
    initializePage();
  }, [session, currentPage]);

  const fetchBookings = async () => {
    if (!session?.user?.token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getBookings(session.user.token, currentPage, itemsPerPage);
      setBookings(response.data);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearchFields = () => {
    setSearchTerm('');
    setSearchBookingId('');
    setSearchDateRange({
      start: null,
      end: null
    });
    setSortField('checkinDate');
    setSortDirection('asc');
  };

  const filteredBookings = bookings
    .filter(booking => {
      const guestName = typeof booking.user === 'object' && booking.user.name 
        ? booking.user.name.toLowerCase() 
        : '';
      
      const matchesGuestName = searchTerm 
        ? guestName.includes(searchTerm.toLowerCase())
        : true;
      
      const matchesBookingId = searchBookingId 
        ? booking._id.toLowerCase().includes(searchBookingId.toLowerCase())
        : true;

      let matchesDateRange = true;
      if (searchDateRange.start && searchDateRange.end) {
        const bookingStart = new Date(booking.checkinDate);
        const bookingEnd = new Date(booking.checkoutDate);
        const searchStart = new Date(searchDateRange.start);
        const searchEnd = new Date(searchDateRange.end);
        
        matchesDateRange = bookingStart >= searchStart && bookingEnd <= searchEnd;
      }

      return matchesGuestName && matchesBookingId && matchesDateRange;
    })
    .sort((a, b) => {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

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
          pages.push(-1); // Ellipsis
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push(-1); // Ellipsis
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push(-1); // Ellipsis
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push(-1); // Ellipsis
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

  const makeReservation = async () => {
    if (!session?.user?.token) {
      alert("Please sign in to make a reservation");
      router.push("/api/auth/signin");
      return;
    }

    if (cid && pickupDate && returnDate) {
      if (returnDate.isBefore(pickupDate)) {
        alert("Check-out date must be after check-in date");
        return;
      }

      setIsLoading(true);
      try {
        console.log("Making reservation with data:", {
          cid,
          dates: {
            checkinDate: dayjs(pickupDate).format("YYYY/MM/DD"),
            checkoutDate: dayjs(returnDate).format("YYYY/MM/DD"),
          },
          userId: session.user._id,
        });

        await createBooking(
          cid,
          {
            startDate: dayjs(pickupDate).format("YYYY-MM-DD"),
            endDate: dayjs(returnDate).format("YYYY-MM-DD"),
            user: session.user._id,
          },
          session.user.token
        );

        setShowSuccess(true);
        setTimeout(() => {
          router.push("/cart");
        }, 2000);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create reservation. Please try again.";
        alert(errorMessage);
        console.error("Reservation error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
  const [returnDate, setReturnDate] = useState<Dayjs | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session?.user?.token) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="luxury-card p-8 text-center max-w-md">
          <h1 className="text-3xl font-serif text-[#C9A55C] mb-4">Sign In Required</h1>
          <div className="w-24 h-[2px] bg-[#C9A55C] mx-auto mb-6"></div>
          <p className="text-gray-300 mb-6">Please sign in to make a reservation</p>
          <button
            onClick={() => router.push("/api/auth/signin")}
            className="luxury-button w-full"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LoadingSpinner />
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="luxury-card p-8 text-center">
            <div className="text-[#C9A55C] text-4xl mb-4">✓</div>
            <p className="text-[#C9A55C] text-xl font-serif mb-2">Reservation successful!</p>
            <p className="text-gray-300 text-sm">
              Redirecting to your reservations...
            </p>
          </div>
        </div>
      )}

      <div className="luxury-section">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-[#C9A55C] mb-6">New Reservation</h1>
          <div className="w-24 h-[2px] bg-[#C9A55C] mx-auto mb-6"></div>
          <p className="text-[#C9A55C] text-xl font-serif">
            {hotelName}
          </p>
        </div>

        <div className="luxury-card p-8 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="text-[#C9A55C] text-xl font-serif">
              Check-in Date
            </div>
            <DateReserve
              onDateChange={(value: Dayjs) => {
                setPickupDate(value);
                setReturnDate(null); // Reset return date if pickup date changes
              }}
              minDate={dayjs()} // Check-in date can't be in the past
            />
          </div>

          <div className="space-y-4">
            <div className="text-[#C9A55C] text-xl font-serif">
              Check-out Date
            </div>
            <DateReserve
              onDateChange={(value: Dayjs) => {
                setReturnDate(value);
              }}
              minDate={
                pickupDate ? pickupDate.add(1, "day") : dayjs().add(1, "day")
              }
              // Check-out date must be at least 1 day after Check-in
            />
          </div>

          <div className="pt-4">
            <button
              className="luxury-button w-full relative"
              onClick={makeReservation}
              disabled={
                !cid || !pickupDate || !returnDate || isLoading
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#C9A55C] mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Reserve This Hotel"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}