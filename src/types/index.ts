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
  role: "user" | "admin";
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
  isAvailable: boolean;
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
  isAvailable: boolean;
}
