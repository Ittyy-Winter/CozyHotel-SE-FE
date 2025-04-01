"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getBookings from "@/libs/booking/getBookings";
import editBooking from "@/libs/booking/updateBooking";
import deleteBooking from "@/libs/booking/deleteBooking";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SearchBar from './SearchBar';

interface Booking {
  _id: string;
  hotel: {
    name: string;
  };
  checkinDate: string;
  checkoutDate: string;
  user: {
    name: string;
    email: string;
  };
}

export default function ReservationCart() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [newCheckinDate, setNewCheckinDate] = useState<Date | null>(null);
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate duration of stay in days
  const calculateDuration = (checkinDate: string, checkoutDate: string) => {
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const diffTime = Math.abs(checkout.getTime() - checkin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (session?.user?.token) {
        try {
          const response = await getBookings(session.user.token);
          setBookings(response.data);
        } catch (error) {
          console.error("Failed to fetch bookings:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookings();
  }, [session]);

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking._id);
    setNewCheckinDate(new Date(booking.checkinDate));
    setNewCheckoutDate(new Date(booking.checkoutDate));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (
      !editingBooking ||
      !newCheckinDate ||
      !newCheckoutDate ||
      !session?.user?.token
    )
      return;

    // Add validation to prevent check-in date being after check-out date
    if (newCheckinDate > newCheckoutDate) {
      alert("Check-in date cannot be after check-out date");
      return;
    }

    setEditLoading(true);
    try {
      await editBooking(editingBooking, session.user.token, {
        checkinDate: newCheckinDate.toISOString(),
        checkoutDate: newCheckoutDate.toISOString(),
      });

      // Refresh bookings after edit
      const response = await getBookings(session.user.token);
      setBookings(response.data);
      setIsEditing(false);
      setEditingBooking(null);
      setSuccessMessage("Booking dates updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert("Failed to update booking. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!session?.user?.token || !bookingToDelete) return;

    setDeleteLoading(bookingToDelete._id);
    try {
      await deleteBooking(bookingToDelete._id, session.user.token);

      // Refresh bookings after deletion
      const response = await getBookings(session.user.token);
      setBookings(response.data);
      setSuccessMessage("Booking deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert("Failed to delete booking. Please try again.");
    } finally {
      setDeleteLoading(null);
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
    }
  };

  const filteredBookings = bookings.filter(booking => 
    booking.hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.user.name && booking.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    booking.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#C9A55C] mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-300">
            Sign in to view and manage your bookings
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A55C] mb-4 mx-auto"></div>
          <div className="text-[#C9A55C] text-lg font-serif">
            Loading your bookings...
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#C9A55C] mb-4">
            No Bookings Yet
          </h2>
          <p className="text-gray-300">
            Start exploring our luxury hotels to make your first booking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-[#C9A55C] text-center mb-12">
          Your Bookings
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search bookings by hotel name, user name, or email..."
            className="max-w-2xl mx-auto"
          />
        </div>

        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300">
                {searchTerm ? 'No bookings found matching your search.' : 'No bookings yet.'}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="luxury-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <h2 className="text-2xl font-serif text-[#C9A55C] mb-2">
                      {booking.hotel.name}
                    </h2>
                    <div className="text-gray-300 space-y-1">
                      {session.user.role === "admin" ? (
                        <p className=" text-gray-400">
                          Booking id: {booking._id}
                        </p>
                      ) : null}
                      {session.user.role === "admin" ? (
                        <p>
                          Booking owner: {booking.user.name || booking.user.email}{" "}
                          ({booking.user.email})
                        </p>
                      ) : null}
                      <p>
                        Check-in:{" "}
                        {new Date(booking.checkinDate).toLocaleDateString()}
                      </p>
                      <p>
                        Check-out:{" "}
                        {new Date(booking.checkoutDate).toLocaleDateString()}
                      </p>
                      <p>
                        Duration:{" "}
                        {calculateDuration(
                          booking.checkinDate,
                          booking.checkoutDate
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="luxury-button"
                    >
                      Edit Dates
                    </button>
                    <button
                      onClick={() => handleDeleteClick(booking)}
                      className="px-4 py-2 text-red-400 border border-red-400 rounded-full
                               hover:bg-red-400/10 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {editingBooking === booking._id && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">
                          Check-in Date
                        </label>
                        <DatePicker
                          selected={newCheckinDate}
                          onChange={(date) => setNewCheckinDate(date)}
                          className="luxury-input w-full"
                          dateFormat="d MMMM yyyy"
                          minDate={new Date()}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">
                          Check-out Date
                        </label>
                        <DatePicker
                          selected={newCheckoutDate}
                          onChange={(date) => setNewCheckoutDate(date)}
                          className="luxury-input w-full"
                          dateFormat="d MMMM yyyy"
                          minDate={newCheckinDate || new Date()}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingBooking(null);
                        }}
                        className="px-4 py-2 text-gray-300 border border-gray-600 rounded-full
                                 hover:bg-gray-800 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="luxury-button"
                        disabled={editLoading}
                      >
                        {editLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-lg shadow-xl text-center relative border border-[#C9A55C]/30">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#C9A55C] transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="text-[#C9A55C] text-4xl mb-4">✓</div>
            <p className="text-gray-300 font-serif">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bookingToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-lg w-96 border border-[#C9A55C]/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-serif text-[#C9A55C] mb-4">
                Delete Booking
              </h2>
              <p className="text-gray-300">
                Are you sure you want to delete your booking at{" "}
                <span className="text-[#C9A55C]">
                  {bookingToDelete.hotel.name}
                </span>
                ?
              </p>
              <p className="text-gray-400 mt-4 text-sm">
                Check-in:{" "}
                {new Date(bookingToDelete.checkinDate).toLocaleDateString()}
                <br />
                Check-out:{" "}
                {new Date(bookingToDelete.checkoutDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleDelete}
                className="px-6 py-2 text-red-400 border border-red-400 rounded-full
                         hover:bg-red-400/10 transition-all duration-300"
                disabled={deleteLoading === bookingToDelete._id}
              >
                {deleteLoading === bookingToDelete._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBookingToDelete(null);
                }}
                className="px-6 py-2 text-gray-300 border border-gray-600 rounded-full
                         hover:bg-gray-800 transition-all duration-300"
                disabled={deleteLoading === bookingToDelete._id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
