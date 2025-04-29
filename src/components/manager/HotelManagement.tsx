'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import getManagerHotels from '@/libs/hotel/getManagerHotels';
import createHotel from '@/libs/hotel/createHotel';
import updateHotelManager from '@/libs/hotel/updateHotelManager';
import deleteHotel from '@/libs/hotel/deleteHotel';
import getBookingsManager from '@/libs/booking/getBookingsManager';
import getRoomTypesByHotel from '@/libs/roomtype/getRoomTypesByHotel'
import updateBookingManager from '@/libs/booking/updateBookingManager';
import { Hotel, HotelUpdate, Booking, RoomType, RoomTypeFormData, AvailableRoomType } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from '../SearchBar';
import DashboardStats from './DashboardStats';
import getAvailableRoomTypes from '@/libs/roomtype/getAvailableRoomTypes';
import { MonthCalendar } from '@mui/x-date-pickers';

export default function HotelManagement() {
  const { data: session } = useSession();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isAddingHotel, setIsAddingHotel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<HotelUpdate>({
    name: '',
    address: '',
    district: '',
    province: '',
    postalcode: '',
    tel: '',
    picture: '',
    description: ''
  });
  const [isViewingBookings, setIsViewingBookings] = useState(false);
  const [selectedHotelBookings, setSelectedHotelBookings] = useState<Booking[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editState, setEditState] = useState<{
    isEditing: boolean;
    editingId: string | null;
  }>({
    isEditing: false,
    editingId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [bookingPage, setBookingPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 6; // Match backend pagination
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    checkinDate: '',
    checkoutDate: '',
  });
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showHotelSuccessMessage, setShowHotelSuccessMessage] = useState(false);

  {/* Room Type */ }
  const [isViewingRoomType, setIsViewingRoomType] = useState(false);
  const [isAddingRoomType, setIsAddingRoomType] = useState(false);
  const [roomTypeFormData, setRoomTypeFormData] = useState<RoomTypeFormData>({
    name: '',
    description: '',
    capacity: 1,
    bedType: '',
    size: '',
    amenities: [],
    facilities: [],
    images: [],
    basePrice: 0,
    currency: 'THB',
    totalRooms: 0,
    nonAvailableRooms: 0,
    isActivated: true,
  });
  const [isEditingRoomType, setIsEditingRoomType] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [roomTypeEditingFormData, setRoomTypeEditingFormData] = useState<RoomTypeFormData>(roomTypeFormData);

  const [isViewingAvailability, setIsViewingAvailability] = useState(false);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<AvailableRoomType[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [roomTypeDailyBookings, setRoomTypeDailyBookings] = useState<{ [date: string]: number }>({});
  const [hotelId, setHotelId] = useState<string>('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const CalendarAvailability = ({
    month,
    availability,
  }: {
    month: Date;
    availability: { [date: string]: number };
  }) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const dates = [];

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const available = availability[dateStr] ?? 0;

      dates.push(
        <div
          key={day}
          className={`border p-2 text-center rounded ${available > 0 ? 'text-[#C9A55C]' : 'text-gray-500'}`}
        >
          <div className="text-xs">{day}</div>
          <div className="text-xs">{available} rooms</div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-white">
            {day}
          </div>
        ))}
        {Array(startOfMonth.getDay()).fill(null).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {dates}
      </div>
    );
  };

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(calendarMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCalendarMonth(newMonth);

    console.log('Changed Month:', newMonth.toLocaleString('default', { month: 'long', year: 'numeric' }));

    setAvailabilityLoading(true);
    fetchRoomAvailabilityForMonth(hotelId, newMonth)
      .finally(() => {
        setAvailabilityLoading(false);
      });
  };


  const fetchRoomAvailabilityForMonth = async (hotelId: string, month: Date) => {
    if (!session?.user?.token) return;
    setIsViewingAvailability(true);

    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    try {
      const response = await getAvailableRoomTypes(
        hotelId,
        firstDayOfMonth.toISOString().split('T')[0],
        lastDayOfMonth.toISOString().split('T')[0],
        session?.user?.token
      );

      console.log('Available Room Types:', response.data.availableRoomTypes);
      setAvailableRoomTypes(response.data.availableRoomTypes || []);

      if (selectedRoomTypeId) {
        const selectedRoom = response.data.availableRoomTypes.find(
          (room: AvailableRoomType) => room.roomTypeId === selectedRoomTypeId
        );
        if (selectedRoom) {
          const autoFillDailyBookings: { [date: string]: number } = {};
          for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            if (selectedRoom.dailyBookings && dateStr in selectedRoom.dailyBookings) {
              const remaining = selectedRoom.totalRooms - selectedRoom.dailyBookings[dateStr];
              autoFillDailyBookings[dateStr] = remaining < 0 ? 0 : remaining;
            } else {
              autoFillDailyBookings[dateStr] = selectedRoom.totalRooms;
            }
          }
          setRoomTypeDailyBookings(autoFillDailyBookings);
        }
      }
    } catch (error) {
      console.error('Error fetching room types availability:', error);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchRoomAvailabilityForMonth(hotelId, calendarMonth);
    }
  }, [hotelId, calendarMonth]);

  useEffect(() => {
    console.log('Calendar Month Changed:', calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' }));
  }, [calendarMonth]); // Log whenever calendarMonth changes

  useEffect(() => {
    console.log('Selected Room Type Changed:', selectedRoomTypeId);
  }, [selectedRoomTypeId]); // Log whenever selectedRoomTypeId changes

  const validateForm = (data: typeof formData) => {
    if (data.name.length > 50) {
      alert('Name cannot be more than 50 characters');
      return false;
    }
    if (data.postalcode.length > 5) {
      alert('Postal Code cannot be more than 5 digits');
      return false;
    }
    if (!data.name.trim()) {
      alert('Please add a name');
      return false;
    }
    if (!data.address) {
      alert('Please add an address');
      return false;
    }
    if (!data.district) {
      alert('Please add a district');
      return false;
    }
    if (!data.province) {
      alert('Please add a province');
      return false;
    }
    if (!data.postalcode) {
      alert('Please add a postal code');
      return false;
    }
    if (!data.picture) {
      alert('Please add a picture URL');
      return false;
    }
    if (!data.description) {
      alert('Please add a description');
      return false;
    }
    return true;
  };

  const router = useRouter();

  useEffect(() => {
    if (session?.user?.token) {
      fetchAllHotels();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.token && !hotelSearchTerm) {
      fetchHotels();
    } else {
      setIsLoading(false);
    }
  }, [session, currentPage, hotelSearchTerm]);

  const fetchAllHotels = async () => {
    if (!session?.user?.token) return;
    try {
      setIsLoading(true);
      const response = await getManagerHotels(session.user.token, 1, 1000); // Fetch a large number of hotels
      setAllHotels(response.data);
      setTotalItems(response.count);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching all hotels:', error);
      setIsLoading(false);
    }
  };

  const fetchHotels = async () => {
    if (!session?.user?.token) return;
    try {
      setIsLoading(true);
      const response = await getManagerHotels(session.user.token, currentPage, itemsPerPage);
      setHotels(response.data);
      setTotalItems(response.count);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;

    try {
      if (!validateForm(formData)) {
        return;
      }

      const hotelData = {
        name: formData.name,
        address: formData.address,
        district: formData.district,
        province: formData.province,
        postalcode: formData.postalcode,
        tel: formData.tel,
        picture: formData.picture,
        description: formData.description
      };

      if (editState.isEditing && editState.editingId) {
        await updateHotelManager(editState.editingId, hotelData, session.user.token);
        setShowHotelSuccessMessage(true);
        setTimeout(() => setShowHotelSuccessMessage(false), 3000);
      } else {
        await createHotel(hotelData, session.user.token);
      }

      setIsAddingHotel(false);
      setEditState({
        isEditing: false,
        editingId: null,
      });
      setFormData({
        name: '',
        address: '',
        district: '',
        province: '',
        postalcode: '',
        tel: '',
        picture: '',
        description: ''
      });

      // Refresh both filtered and all hotels
      await fetchHotels();
      await fetchAllHotels();
    } catch (error) {
      console.log('Error saving hotel:', error);
      alert('Failed to save hotel. Please try again.');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditState({
      isEditing: true,
      editingId: hotel._id,
    });
    setFormData({
      name: hotel.name,
      address: hotel.address,
      district: hotel.district,
      province: hotel.province,
      postalcode: hotel.postalcode,
      tel: hotel.tel,
      picture: hotel.picture,
      description: hotel.description
    });
    setIsAddingHotel(true);
  };

  const handleDelete = async (hotelId: string) => {
    if (!session?.user?.token) return;
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await deleteHotel(hotelId, session.user.token);
        fetchHotels();
      } catch (error) {
        console.error('Error deleting hotel:', error);
      }
    }
  };

  const handleViewRoomAvailability = async (hotelId: string) => {
    setHotelId(hotelId);
    setSelectedRoomTypeId(null);
    setRoomTypeDailyBookings({});
    setCalendarMonth(new Date());

    if (!session?.user?.token) return;
    fetchRoomAvailabilityForMonth(hotelId, new Date());
  };


  const handleViewBookings = async (hotelId: string) => {
    if (!session?.user?.token) return;
    setBookingsLoading(true);
    setSelectedHotel(hotels.find(h => h._id === hotelId) || null);
    try {
      // Fetch all bookings for searching
      const allBookingsResponse = await getBookingsManager(hotelId, session.user.token, 1, 1000);
      setAllBookings(allBookingsResponse.data);

      // Fetch paginated bookings for display
      const response = await getBookingsManager(hotelId, session.user.token, bookingPage, bookingsPerPage);
      setSelectedHotelBookings(response.data);
      setTotalBookings(response.count);
      setIsViewingBookings(true);
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
      alert('Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleViewRoomType = async (hotelId: string) => {
    if (!session?.user?.token) return;
    setBookingsLoading(true);
    setSelectedHotel(hotels.find(h => h._id === hotelId) || null);
    try {
      const allBookingsResponse = await getRoomTypesByHotel(hotelId, session.user.token, 1, 1000);
      setAllBookings(allBookingsResponse.data);

      const response = await getRoomTypesByHotel(hotelId, session.user.token, bookingPage, bookingsPerPage);

      if (response.data.length === 0) {
        setSelectedRoomType([]);
        setTotalBookings(0);
      } else {
        setSelectedRoomType(response.data);
        setTotalBookings(response.count);
      }

      setIsViewingRoomType(true);
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
      console.log('Failed to fetch bookings');
      setSelectedRoomType([]);
      setTotalBookings(0);
      setIsViewingRoomType(true);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleBookingPageChange = async (newPage: number) => {
    if (!selectedHotel || !session?.user?.token) return;
    setBookingsLoading(true);
    try {
      const response = await getBookingsManager(selectedHotel._id, session.user.token, newPage, bookingsPerPage);
      setSelectedHotelBookings(response.data);
      setTotalBookings(response.count);
      setBookingPage(newPage);
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingHotel(false);
    setEditState({
      isEditing: false,
      editingId: null,
    });
    setFormData({
      name: '',
      address: '',
      district: '',
      province: '',
      postalcode: '',
      tel: '',
      picture: '',
      description: ''
    });
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

  const filteredBookings = searchTerm || searchDateRange.start || searchDateRange.end || searchBookingId
    ? allBookings.filter(booking => {
      const user = booking.user;
      const matchesSearchTerm = !searchTerm ||
        (typeof user === 'object' && user !== null && 'name' in user && user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user === 'object' && user !== null && 'email' in user && user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDateRange = (!searchDateRange.start || new Date(booking.checkinDate) >= new Date(searchDateRange.start)) &&
        (!searchDateRange.end || new Date(booking.checkoutDate) <= new Date(searchDateRange.end));

      const matchesBookingId = !searchBookingId ||
        booking._id.toLowerCase().includes(searchBookingId.toLowerCase());

      return matchesSearchTerm && matchesDateRange && matchesBookingId;
    })
    : selectedHotelBookings;

  const filteredRoomType = (searchTerm)
    ? selectedRoomType.filter((room) => {
      const matchesSearchTerm = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearchTerm;
    })
    : selectedRoomType;

  const handleCloseModal = () => {
    setIsViewingBookings(false);
    setSelectedHotel(null);
    setSelectedHotelBookings([]);
    setBookingPage(1);
    setTotalBookings(0);
    clearSearchFields();
  };

  const handleSubmitRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !selectedHotel) return;

    const payload = {
      hotelId: selectedHotel._id,
      name: roomTypeFormData.name,
      description: roomTypeFormData.description,
      capacity: roomTypeFormData.capacity,
      bedType: roomTypeFormData.bedType,
      size: roomTypeFormData.size,
      amenities: roomTypeFormData.amenities,
      facilities: roomTypeFormData.facilities,
      images: roomTypeFormData.images,
      basePrice: roomTypeFormData.basePrice,
      currency: roomTypeFormData.currency,
      totalRooms: roomTypeFormData.totalRooms,
      nonAvailableRooms: roomTypeFormData.nonAvailableRooms,
      isActivated: roomTypeFormData.isActivated,
    };

    console.log('Payload ที่ส่งไป:', payload);

    try {
      const response = await fetch(
        `https://cozy-hotel-se-be.vercel.app/api/v1/manager/hotels/${selectedHotel._id}/roomtypes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response error:', errorData);
        throw new Error('Failed to create room type');
      }

      const updatedRoomTypes = await getRoomTypesByHotel(selectedHotel._id, session.user.token, 1, 1000);
      setSelectedRoomType(updatedRoomTypes.data);
      setAllBookings(updatedRoomTypes.data);

      setIsAddingRoomType(false);
      setRoomTypeFormData({
        name: '',
        description: '',
        capacity: 1,
        bedType: '',
        size: '',
        amenities: [],
        facilities: [],
        images: [],
        basePrice: 0,
        currency: 'THB',
        totalRooms: 0,
        nonAvailableRooms: 0,
        isActivated: true,
      });

      console.log('Room type created successfully');
    } catch (error) {
      console.error('Error creating room type:', error);
      console.log('Failed to create room type');
    }
  };

  const handleEditRoomType = (room: RoomType) => {
    setIsEditingRoomType(true);
    setEditingRoomType(room);
    setRoomTypeEditingFormData({
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      bedType: room.bedType,
      size: room.size,
      amenities: room.amenities,
      facilities: room.facilities,
      images: room.images,
      basePrice: room.basePrice,
      currency: room.currency,
      totalRooms: room.totalRooms,
      nonAvailableRooms: room.nonAvailableRooms,
      isActivated: room.isActivated,
    });
  };

  const handleUpdateRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !editingRoomType || !selectedHotel) return;

    try {
      const payload = {
        id: editingRoomType._id,
        hotelId: selectedHotel._id,
        name: roomTypeEditingFormData.name,
        description: roomTypeEditingFormData.description,
        capacity: roomTypeEditingFormData.capacity,
        bedType: roomTypeEditingFormData.bedType,
        size: roomTypeEditingFormData.size,
        amenities: roomTypeEditingFormData.amenities,
        facilities: roomTypeEditingFormData.facilities,
        images: roomTypeEditingFormData.images,
        basePrice: roomTypeEditingFormData.basePrice,
        currency: roomTypeEditingFormData.currency,
        totalRooms: roomTypeEditingFormData.totalRooms,
        nonAvailableRooms: roomTypeEditingFormData.nonAvailableRooms,
        isActivated: roomTypeEditingFormData.isActivated,
      };

      const response = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/manager/roomtypes/${editingRoomType._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update room type');

      const updatedRoomTypes = await getRoomTypesByHotel(selectedHotel._id, session.user.token, 1, 1000);
      setSelectedRoomType(updatedRoomTypes.data);

      setIsEditingRoomType(false);
      setEditingRoomType(null);
    } catch (error) {
      console.error('Error updating room type:', error);
      alert('Failed to update room type');
    }
  };

  const handleCancelEditRoomType = () => {
    setIsEditingRoomType(false);
    setEditingRoomType(null);
  };

  // Deactivate Room Type
  const handleDeactivateRoomType = async (room: RoomType) => {
    if (!session?.user?.token || !selectedHotel) return;

    try {
      const payload = {
        id: room._id,
        hotelId: selectedHotel._id,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        bedType: room.bedType,
        size: room.size,
        amenities: room.amenities,
        facilities: room.facilities,
        images: room.images,
        basePrice: room.basePrice,
        currency: room.currency,
        totalRooms: room.totalRooms,
        nonAvailableRooms: room.nonAvailableRooms,
        isActivated: false,
      };

      const response = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/manager/roomtypes/${room._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to deactivate room type');

      const updatedRoomTypes = await getRoomTypesByHotel(selectedHotel._id, session.user.token, 1, 1000);
      setSelectedRoomType(updatedRoomTypes.data);
    } catch (error) {
      console.error('Error deactivating room type:', error);
      alert('Failed to deactivate room type');
    }
  };

  const handleActivateRoomType = async (room: RoomType) => {
    if (!session?.user?.token || !selectedHotel) return;

    try {
      const payload = {
        id: room._id,
        hotelId: selectedHotel._id,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        bedType: room.bedType,
        size: room.size,
        amenities: room.amenities,
        facilities: room.facilities,
        images: room.images,
        basePrice: room.basePrice,
        currency: room.currency,
        totalRooms: room.totalRooms,
        nonAvailableRooms: room.nonAvailableRooms,
        isActivated: true,
      };

      const response = await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/manager/roomtypes/${room._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to activate room type');

      const updatedRoomTypes = await getRoomTypesByHotel(selectedHotel._id, session.user.token, 1, 1000);
      setSelectedRoomType(updatedRoomTypes.data);
    } catch (error) {
      console.error('Error activating room type:', error);
      alert('Failed to activate room type');
    }
  };

  // Delete Room Type
  const handleDeleteRoomType = async (roomId: string) => {
    if (!session?.user?.token) return;

    try {
      await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/manager/roomtypes/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (selectedHotel) {
        const updatedRoomTypes = await getRoomTypesByHotel(selectedHotel._id, session.user.token, 1, 1000);
        setSelectedRoomType(updatedRoomTypes.data);
      }
    } catch (error) {
      console.error('Error deleting room type:', error);
      alert('Failed to delete room type');
    }
  };

  const Pagination = ({ totalItems, currentPage, onPageChange }: {
    totalItems: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 1;

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

  const filteredHotels = hotelSearchTerm
    ? allHotels.filter(hotel =>
      hotel.name.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
      hotel.district.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
      hotel.province.toLowerCase().includes(hotelSearchTerm.toLowerCase())
    )
    : hotels;

  const handleDeleteBooking = async (bookingId: string) => {
    if (!session?.user?.token || !selectedHotel) return;
    const booking = filteredBookings.find(b => b._id === bookingId);
    if (booking) {
      setBookingToDelete(booking);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteBooking = async () => {
    if (!session?.user?.token || !selectedHotel || !bookingToDelete) return;

    setIsDeletingBooking(true);
    try {
      await fetch(`https://cozy-hotel-se-be.vercel.app/api/v1/manager/bookings/${bookingToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
      });

      // Refresh bookings after deletion
      const response = await getBookingsManager(selectedHotel._id, session.user.token, bookingPage, bookingsPerPage);
      setSelectedHotelBookings(response.data);
      setTotalBookings(response.count);

      // Also refresh all bookings for search
      const allBookingsResponse = await getBookingsManager(selectedHotel._id, session.user.token, 1, 1000);
      setAllBookings(allBookingsResponse.data);

      // Show success message
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    } finally {
      setIsDeletingBooking(false);
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingFormData({
      checkinDate: new Date(booking.checkinDate).toISOString().split('T')[0],
      checkoutDate: new Date(booking.checkoutDate).toISOString().split('T')[0],
    });
    setIsEditingBooking(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !editingBooking || !selectedHotel) return;

    setIsUpdatingBooking(true);
    try {
      // Utility function to format Date object to "YYYY-MM-DD" format
      const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0]; // Extract the "YYYY-MM-DD" part
      };

      await updateBookingManager(
        editingBooking._id,
        {
          checkinDate: formatDate(new Date(bookingFormData.checkinDate)),
          checkoutDate: formatDate(new Date(bookingFormData.checkoutDate)),
        },
        session.user.token
      );

      // Refresh bookings after update
      const response = await getBookingsManager(selectedHotel._id, session.user.token, bookingPage, bookingsPerPage);
      setSelectedHotelBookings(response.data);
      setTotalBookings(response.count);

      // Also refresh all bookings for search
      const allBookingsResponse = await getBookingsManager(selectedHotel._id, session.user.token, 1, 1000);
      setAllBookings(allBookingsResponse.data);

      setIsEditingBooking(false);
      setEditingBooking(null);
      setBookingFormData({
        checkinDate: '',
        checkoutDate: '',
      });

      // Show success message
      setShowSuccessMessage(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const handleCancelEditBooking = () => {
    setIsEditingBooking(false);
    setEditingBooking(null);
    setBookingFormData({
      checkinDate: '',
      checkoutDate: '',
    });
  };

  const handleCancelAddRoomType = () => {
    setIsAddingRoomType(false);
    setRoomTypeFormData({
      name: '',
      description: '',
      capacity: 1,
      bedType: '',
      size: '',
      amenities: [],
      facilities: [],
      images: [],
      basePrice: 0,
      currency: 'THB',
      totalRooms: 0,
      nonAvailableRooms: 0,
      isActivated: true,
    });
  };

  function parseNumberInput(value: string): number {
    return value === '' ? 0 : Number(value);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session?.user?.token) {
    return <p>Please sign in to manage hotels</p>;
  }

  return (
    <div>
      {/* Success Messages */}
      {showHotelSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-900/20 border border-green-500 text-green-500 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Hotel updated successfully!</span>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-900/20 border border-green-500 text-green-500 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Booking updated successfully!</span>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed top-4 right-4 bg-green-900/20 border border-green-500 text-green-500 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Booking deleted successfully!</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bookingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-md w-full border border-red-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-red-500">Confirm Delete</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBookingToDelete(null);
                }}
                className="text-gray-400 hover:text-white"
                disabled={isDeletingBooking}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete this booking?
              </p>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <p className="text-white font-medium">
                  {typeof bookingToDelete.user === 'object' ? bookingToDelete.user.name : 'Loading...'}
                </p>
                <p className="text-gray-400 text-sm">
                  Check-in: {new Date(bookingToDelete.checkinDate).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-sm">
                  Check-out: {new Date(bookingToDelete.checkoutDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBookingToDelete(null);
                }}
                className="px-4 py-2 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                  hover:bg-[#C9A55C] hover:text-white transition-colors disabled:opacity-50"
                disabled={isDeletingBooking}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBooking}
                className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-500 rounded 
                  hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center space-x-2"
                disabled={isDeletingBooking}
              >
                {isDeletingBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-serif text-[#C9A55C] mb-6">Hotel Management</h2>

      {/* Dashboard */}
      <div className="mb-6">
        <DashboardStats />
      </div>

      {/* Hotel Search */}
      <div className="mb-6">
        <SearchBar
          onSearch={setHotelSearchTerm}
          placeholder="Search hotels by name, address, district, or province..."
          value={hotelSearchTerm}
        />
      </div>

      {/* Hotel List */}
      <div className="grid gap-4 mb-8">
        {filteredHotels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300">
              {hotelSearchTerm ? 'No hotels found matching your search.' : 'No hotels found.'}
            </p>
          </div>
        ) : (
          filteredHotels.map((hotel) => (
            <div
              key={hotel._id}
              className="border border-[#333333] rounded-lg p-4 flex justify-between items-center 
                bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
            >
              <div>
                <h3 className="font-semibold text-white">{hotel.name}</h3>
                <p className="text-sm text-gray-400">{hotel.address}</p>
                <p className="text-sm text-gray-400">{hotel.district}, {hotel.province}</p>
                <p className="text-sm text-gray-400">Tel: {hotel.tel}</p>
              </div>
              <div className="flex space-x-2">
                {/* <button
                  onClick={() => {
                    console.log('Button Clicked');
                    setHotelId(hotel._id);
                    fetchRoomAvailabilityForMonth(hotel._id, calendarMonth);
                  }}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                    hover:bg-[#C9A55C] hover:text-white transition-colors"
                >
                  View Available room
                </button> */}
                <button
                  onClick={() => handleViewRoomAvailability(hotel._id)}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                    hover:bg-[#C9A55C] hover:text-white transition-color"
                >
                  View Available room
                </button>
                <button
                  onClick={() => handleViewBookings(hotel._id)}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                    hover:bg-[#C9A55C] hover:text-white transition-colors"
                >
                  View Bookings
                </button>
                <button
                  onClick={() => handleViewRoomType(hotel._id)}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                    hover:bg-[#C9A55C] hover:text-white transition-colors"
                >
                  View Room Type
                </button>
                <button
                  onClick={() => handleEdit(hotel)}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                    hover:bg-[#C9A55C] hover:text-white transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredHotels.length > 0 && (
        <Pagination
          totalItems={hotelSearchTerm ? filteredHotels.length : totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Bookings Modal */}
      {isViewingBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-[#C9A55C]">
                Bookings for {selectedHotel?.name}
              </h3>
              <button
                onClick={() => setIsViewingBookings(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Booking Search Controls */}
            <div className="mb-6 space-y-4">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search bookings by guest name or email..."
              />
              <div className="flex gap-4">
                <input
                  type="date"
                  value={searchDateRange.start || ''}
                  onChange={(e) => setSearchDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                />
                <input
                  type="date"
                  value={searchDateRange.end || ''}
                  onChange={(e) => setSearchDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                />
                <input
                  type="text"
                  value={searchBookingId}
                  onChange={(e) => setSearchBookingId(e.target.value)}
                  placeholder="Search by Booking ID"
                  className="flex-1 p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                />
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    {searchTerm || searchDateRange.start || searchDateRange.end || searchBookingId
                      ? 'No bookings found matching your search.'
                      : 'No bookings found.'}
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking._id} className="border border-[#333333] rounded-lg p-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white font-medium">
                          {typeof booking.user === 'object' ? booking.user.name : 'Loading...'}
                        </p>
                        <p className="text-gray-400">
                          Check-in: {new Date(booking.checkinDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400">
                          Check-out: {new Date(booking.checkoutDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#C9A55C]">Booking ID: {booking._id}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(booking.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-2 space-x-2">
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                              hover:bg-[#C9A55C] hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking._id)}
                            disabled={isDeletingBooking}
                            className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-500 rounded 
                              hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                          >
                            {isDeletingBooking ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Only show pagination if there are bookings and we're not searching */}
            {filteredBookings.length > 0 && !searchTerm && !searchDateRange.start && !searchDateRange.end && !searchBookingId && (
              <Pagination
                totalItems={totalBookings}
                currentPage={bookingPage}
                onPageChange={handleBookingPageChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {isEditingBooking && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-[#C9A55C]">Edit Booking</h3>
              <button
                onClick={handleCancelEditBooking}
                className="text-gray-400 hover:text-white"
                disabled={isUpdatingBooking}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={bookingFormData.checkinDate}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, checkinDate: e.target.value }))}
                  className="w-full p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                  required
                  disabled={isUpdatingBooking}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={bookingFormData.checkoutDate}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, checkoutDate: e.target.value }))}
                  className="w-full p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                  required
                  disabled={isUpdatingBooking}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancelEditBooking}
                  className="px-4 py-2 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                    hover:bg-[#C9A55C] hover:text-white transition-colors disabled:opacity-50"
                  disabled={isUpdatingBooking}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A55C] text-white rounded hover:bg-[#B38B4A] transition-colors 
                    disabled:opacity-50 flex items-center space-x-2"
                  disabled={isUpdatingBooking}
                >
                  {isUpdatingBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isAddingHotel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-8 rounded-lg w/full max-w-4xl border border-[#333333]">
            <h3 className="text-2xl font-serif text-[#C9A55C] mb-6">
              {editState.isEditing ? 'Edit Hotel' : 'Add New Hotel'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Hotel Name</label>
                    <input
                      type="text"
                      placeholder="Hotel Name"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">Address</label>
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">District</label>
                    <input
                      type="text"
                      placeholder="District"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">Province</label>
                    <input
                      type="text"
                      placeholder="Province"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">Postal Code</label>
                    <input
                      type="text"
                      placeholder="Postal Code"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.postalcode}
                      onChange={(e) => setFormData({ ...formData, postalcode: e.target.value })}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">Telephone</label>
                    <input
                      type="text"
                      placeholder="Telephone"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.tel}
                      onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">Picture URL</label>
                    <input
                      type="text"
                      placeholder="Picture URL"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.picture}
                      onChange={(e) => setFormData({ ...formData, picture: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-400">Description</label>
                    <textarea
                      placeholder="Description"
                      className="w-full p-2 bg-[#1A1A1A] border border-[#333333] rounded text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#C9A55C] text-white font-serif rounded hover:bg-[#B38B4A] transition-colors"
                    >
                      {editState.isEditing ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded hover:bg-[#C9A55C] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Type Modal */}
      {isViewingRoomType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-[#C9A55C]">
                Room type of {selectedHotel?.name}
              </h3>
              <button
                onClick={() => setIsAddingRoomType(true)}
                className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded 
                              hover:bg-[#C9A55C] hover:text-white transition-colors"
              >
                Add New Room Type
              </button>
              <button
                onClick={() => setIsViewingRoomType(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Room Type Search Controls */}
            <div className="mb-6 space-y-4">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search room types by name or description..."
              />
              {/* <div className="flex gap-4">
                <input
                  type="date"
                  value={searchDateRange.start || ''}
                  onChange={(e) => setSearchDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                />
                <input
                  type="date"
                  value={searchDateRange.end || ''}
                  onChange={(e) => setSearchDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                />
                <input
                  type="text"
                  value={searchBookingId}
                  onChange={(e) => setSearchBookingId(e.target.value)}
                  placeholder="Search by Booking ID"
                  className="flex-1 p-2 bg-[#2A2A2A] border border-[#333333] rounded text-white"
                />
              </div> */}
            </div>

            {/* Room Type List */}
            <div className="space-y-4">
              {filteredRoomType.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    {searchTerm
                      ? 'No room types found matching your search.'
                      : 'No room types found.'}
                  </p>
                </div>
              ) : (
                filteredRoomType.map((room) => (
                  <div
                    key={room._id}
                    className={`border rounded-lg p-4 transition-colors
    ${room.isActivated
                        ? 'border-[#333333] bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                        : 'border-gray-700 bg-gray-800 opacity-60'}`}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-lg text-white">{room.name}</p>
                        <p className="text-sm text-gray-400">{room.description}</p>
                        <p className="text-sm text-gray-400">Capacity: {room.capacity} people</p>
                        <p className="text-sm text-gray-400">Bed Type: {room.bedType}</p>
                        <p className="text-sm text-gray-400">Price: {room.basePrice} {room.currency}</p>
                        <p className="text-sm text-gray-400">
                          Amenities: {room.amenities.join(', ')}
                        </p>
                        <p className="text-sm text-gray-400">
                          Facilities: {room.facilities.join(', ')}
                        </p>
                        <p className={`text-sm ${room.isActivated ? 'text-green-500' : 'text-red-500'}`}>
                          {room.isActivated ? 'Available' : 'Deactivated'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#C9A55C]">Room Type ID: {room._id}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(room.createdAt).toLocaleString()}
                        </p>

                        <div className="mt-2 space-x-2">
                          {room.isActivated ? (
                            <>
                              <button
                                onClick={() => handleEditRoomType(room)}
                                className="px-3 py-1 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded hover:bg-[#C9A55C] hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeactivateRoomType(room)}
                                className="px-3 py-1 bg-yellow-900/20 text-yellow-500 border border-yellow-500 rounded hover:bg-yellow-500 hover:text-white"
                              >
                                Deactivate
                              </button>
                              <button
                                onClick={() => handleDeleteRoomType(room._id)}
                                className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleActivateRoomType(room)}
                                className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-500 rounded hover:bg-green-500 hover:text-white"
                              >
                                Activate
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Only show pagination if there are bookings and we're not searching */}
            {filteredRoomType.length > 0 && !searchTerm && !searchDateRange.start && !searchDateRange.end && !searchBookingId && (
              <Pagination
                totalItems={totalBookings}
                currentPage={bookingPage}
                onPageChange={handleBookingPageChange}
              />
            )}
          </div>
        </div>
      )}

      {isViewingAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-[#C9A55C]">Room Available</h3>
              <button
                onClick={() => {
                  setIsViewingAvailability(false);
                  setSelectedRoomTypeId(null);
                  setRoomTypeDailyBookings({});
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Room Type Dropdown */}
            <div className="mb-6">
              <select
                className="w-full p-2 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded"
                value={selectedRoomTypeId || ''}
                onChange={(e) => {
                  const roomId = e.target.value;
                  setSelectedRoomTypeId(roomId);

                  const selectedRoom = availableRoomTypes.find(room => room.roomTypeId === roomId);

                  if (selectedRoom) {
                    const autoFillDailyBookings: { [date: string]: number } = {};
                    const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                    const lastDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);

                    for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
                      const dateStr = d.toISOString().split('T')[0];

                      if (selectedRoom.dailyBookings && dateStr in selectedRoom.dailyBookings) {
                        const remaining = selectedRoom.totalRooms - selectedRoom.dailyBookings[dateStr];
                        autoFillDailyBookings[dateStr] = remaining < 0 ? 0 : remaining;
                      } else {
                        autoFillDailyBookings[dateStr] = selectedRoom.totalRooms;
                      }
                    }

                    setRoomTypeDailyBookings(autoFillDailyBookings);
                  } else {
                    setRoomTypeDailyBookings({});
                  }
                }}
              >
                <option value="">Select Room Type</option>
                {availableRoomTypes.map((room) => (
                  <option key={room.roomTypeId} value={room.roomTypeId}>
                    {room.roomTypeDetails.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div className="flex justify-between mb-4">
              <button
                onClick={() => handleChangeMonth('prev')}
                className="bg-[#2A2A2A] text-[#C9A55C] p-2 rounded hover:bg-[#C9A55C] hover:text-white"
              >
                Previous Month
              </button>
              <span className="text-[#C9A55C] text-lg">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button
                onClick={() => handleChangeMonth('next')}
                className="bg-[#2A2A2A] text-[#C9A55C] p-2 rounded hover:bg-[#C9A55C] hover:text-white"
              >
                Next Month
              </button>
            </div>

            {/* Calendar */}
            {availabilityLoading ? (
              <LoadingSpinner />
            ) : selectedRoomTypeId ? (
              <div>
                <CalendarAvailability month={calendarMonth} availability={roomTypeDailyBookings} />
              </div>
            ) : (
              <p className="text-center text-gray-500">Please select a room type to view availability.</p>
            )}

          </div>
        </div>
      )}

      {isAddingRoomType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl overflow-y-auto max-h-screen bg-[#1A1A1A] rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-serif text-[#C9A55C]">Add Room Type</h3>
              <button
                onClick={handleCancelAddRoomType}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRoomType} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Room Type Name */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Room Type Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    value={roomTypeFormData.name}
                    onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, name: e.target.value })}
                    maxLength={50}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Description</label>
                  <textarea
                    placeholder="Description"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    value={roomTypeFormData.description}
                    onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Capacity + Bed Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-400">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={roomTypeFormData.capacity}
                      onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, capacity: parseNumberInput(e.target.value) })}
                      required
                    />
                  </div>

                  {/* Bed Type */}
                  <div>
                    <label className="block mb-1 text-sm text-gray-400">Bed Type</label>
                    <select
                      className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white focus:border-[#C9A55C] focus:outline-none"
                      value={roomTypeFormData.bedType}
                      onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, bedType: e.target.value })}
                      required
                    >
                      <option value="">Select Bed Type</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                      <option value="Twin">Twin</option>
                      <option value="Bunk Beds">Bunk Beds</option>
                      <option value="Sofa Bed">Sofa Bed</option>
                    </select>
                  </div>
                </div>

                {/* Room Size */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Room Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 40 sqm"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    value={roomTypeFormData.size}
                    onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, size: e.target.value })}
                    required
                  />
                </div>

                {/* Base Price + Total Rooms + Non Available Rooms */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-400">Base Price (THB)</label>
                    <input
                      type="number"
                      className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={roomTypeFormData.basePrice}
                      onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, basePrice: parseNumberInput(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm text-gray-400">Total Rooms</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={roomTypeFormData.totalRooms}
                      onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, totalRooms: parseNumberInput(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm text-gray-400">Non Available</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                      value={roomTypeFormData.nonAvailableRooms}
                      onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, nonAvailableRooms: parseNumberInput(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {/* Is Available */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Is Available</label>
                  <select
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white focus:border-[#C9A55C] focus:outline-none"
                    value={roomTypeFormData.isActivated ? "true" : "false"}
                    onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, isActivated: e.target.value === "true" })}
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Amenities (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Free Wi-Fi, Air conditioning"
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    value={roomTypeFormData.amenities.join(', ')}
                    onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, amenities: e.target.value.split(',').map(x => x.trim()) })}
                  />
                </div>

                {/* Facilities (Checkbox group) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-400">Facilities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Free Wi-Fi",
                      "Swimming pool",
                      "Free parking",
                      "Front desk [24-hour]",
                      "Restaurant",
                      "Bar",
                      "Massage",
                      "Airport transfer",
                      "Air conditioning",
                      "Heating",
                      "Private bathroom",
                      "Television",
                      "Mini-bar",
                      "Coffee/tea maker",
                      "Safe",
                      "Balcony/terrace",
                      "Non-smoking rooms available",
                      "Soundproofing"
                    ].map((facility) => (
                      <label key={facility} className="flex items-center space-x-2 text-white">
                        <input
                          type="checkbox"
                          value={facility}
                          checked={roomTypeFormData.facilities.includes(facility)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoomTypeFormData(prev => ({
                                ...prev,
                                facilities: [...prev.facilities, facility]
                              }));
                            } else {
                              setRoomTypeFormData(prev => ({
                                ...prev,
                                facilities: prev.facilities.filter(f => f !== facility)
                              }));
                            }
                          }}
                          className="accent-[#C9A55C]"
                        />
                        <span className="text-sm">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Images (comma separated URLs)</label>
                  <input
                    type="text"
                    placeholder="https://..., https://..."
                    className="w-full rounded border border-[#333] bg-[#1A1A1A] p-2 text-white placeholder:text-gray-500 focus:border-[#C9A55C] focus:outline-none"
                    value={roomTypeFormData.images.join(', ')}
                    onChange={(e) => setRoomTypeFormData({ ...roomTypeFormData, images: e.target.value.split(',').map(x => x.trim()) })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelAddRoomType}
                  className="rounded border border-[#C9A55C] bg-[#2A2A2A] px-4 py-2 text-[#C9A55C] transition-colors hover:bg-[#C9A55C] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 rounded bg-[#C9A55C] px-4 py-2 text-white transition-colors hover:bg-[#B38B4A] disabled:opacity-50"
                >
                  Add Room Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditingRoomType && editingRoomType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl overflow-y-auto max-h-screen bg-[#1A1A1A] rounded-lg p-6">
            <h3 className="text-xl font-serif text-[#C9A55C] mb-4">Edit Room Type</h3>
            <form onSubmit={handleUpdateRoomType} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                  value={roomTypeEditingFormData.name}
                  onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                  value={roomTypeEditingFormData.description}
                  onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, description: e.target.value })}
                />
              </div>

              {/* Capacity + BedType */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                    value={roomTypeEditingFormData.capacity}
                    onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, capacity: parseNumberInput(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bed Type</label>
                  <select
                    className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                    value={roomTypeEditingFormData.bedType}
                    onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, bedType: e.target.value })}
                  >
                    <option value="">Select Bed Type</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                    <option value="Twin">Twin</option>
                    <option value="Bunk Beds">Bunk Beds</option>
                    <option value="Sofa Bed">Sofa Bed</option>
                  </select>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block mb-1 text-sm text-gray-400">Room Size</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                  value={roomTypeEditingFormData.size}
                  onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, size: e.target.value })}
                />
              </div>

              {/* BasePrice + TotalRooms + NonAvailableRooms */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Base Price (THB)</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                    placeholder="Base Price"
                    value={roomTypeEditingFormData.basePrice}
                    onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, basePrice: parseNumberInput(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-400">Total Rooms</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                    placeholder="Total Rooms"
                    value={roomTypeEditingFormData.totalRooms}
                    onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, totalRooms: parseNumberInput(e.target.value) })}
                  />
                  <div>
                    <label className="block mb-1 text-sm text-gray-400">Non Available</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                      placeholder="Non Available"
                      value={roomTypeEditingFormData.nonAvailableRooms}
                      onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, nonAvailableRooms: parseNumberInput(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Is Available */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Is Available</label>
                <select
                  className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                  value={roomTypeEditingFormData.isActivated ? "true" : "false"}
                  onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, isActivated: e.target.value === "true" })}
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                  value={roomTypeEditingFormData.amenities.join(', ')}
                  onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, amenities: e.target.value.split(',').map(x => x.trim()) })}
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Images (comma separated URLs)</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-[#2A2A2A] border border-[#333] text-white"
                  value={roomTypeEditingFormData.images.join(', ')}
                  onChange={(e) => setRoomTypeEditingFormData({ ...roomTypeEditingFormData, images: e.target.value.split(',').map(x => x.trim()) })}
                />
              </div>

              {/* Facilities (Checkbox) */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Free Wi-Fi",
                  "Swimming pool",
                  "Free parking",
                  "Front desk [24-hour]",
                  "Restaurant",
                  "Bar",
                  "Massage",
                  "Airport transfer",
                  "Air conditioning",
                  "Heating",
                  "Private bathroom",
                  "Television",
                  "Mini-bar",
                  "Coffee/tea maker",
                  "Safe",
                  "Balcony/terrace",
                  "Non-smoking rooms available",
                  "Soundproofing"
                ].map(facility => (
                  <label key={facility} className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      className="accent-[#C9A55C]"
                      checked={roomTypeEditingFormData.facilities.includes(facility)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRoomTypeEditingFormData(prev => ({
                            ...prev,
                            facilities: [...prev.facilities, facility]
                          }));
                        } else {
                          setRoomTypeEditingFormData(prev => ({
                            ...prev,
                            facilities: prev.facilities.filter(f => f !== facility)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{facility}</span>
                  </label>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEditRoomType}
                  className="px-4 py-2 bg-[#2A2A2A] text-[#C9A55C] border border-[#C9A55C] rounded hover:bg-[#C9A55C] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A55C] text-white rounded hover:bg-[#B38B4A]"
                >
                  Update
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

