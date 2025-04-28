export interface Hotel {
  _id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  picture: string;
  description: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: "user" | "admin" | "manager";
  createAt: Date;
}

export interface Booking {
  _id: string;
  checkinDate: Date;
  checkoutDate: Date;
  user: User | string;
  hotel: Hotel | string;
  createdAt: Date;
}

export interface RoomType {
  _id: string;
  hotelId: string;
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
  totalRooms: number;
  nonAvailableRooms: number;
  isActivated: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface BookingUpdate {
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export interface HotelUpdate {
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel?: string;
  picture: string;
  description: string;
}

export interface RoomTypeFormData {
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
  totalRooms: number;
  nonAvailableRooms: number;
  isActivated: boolean;
}

export interface AvailableRoomType {
  roomTypeId: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  isActivated: boolean;
  roomTypeDetails: {
    name: string;
    capacity: number;
    bedType: string;
    basePrice: number;
    currency: string;
  };
  dailyBookings: {
    [date: string]: number; // map of date -> number of bookings
  };
};