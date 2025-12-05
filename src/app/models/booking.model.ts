/**
 * Booking Status Enum
 * Defines the possible states of a booking
 */
export enum BookingStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

/**
 * Booking Interface
 * Represents a hotel room booking with all necessary details
 */
export interface Booking {
  /** Unique identifier for the booking */
  id: string;
  
  /** Reference to the booked room's ID */
  roomId: string;
  
  /** Room name/number for display purposes */
  roomName: string;
  
  /** Room type for display purposes */
  roomType: string;
  
  /** Guest's full name */
  guestName: string;
  
  /** Check-in date in ISO format (YYYY-MM-DD) */
  checkInDate: string;
  
  /** Check-out date in ISO format (YYYY-MM-DD) */
  checkOutDate: string;
  
  /** Calculated total price for the stay */
  totalPrice: number;
  
  /** Calculated number of nights */
  numberOfNights: number;
  
  /** Timestamp when booking was created */
  bookingDate: string;
  
  /** Current status of the booking */
  status: BookingStatus;
}

/**
 * Booking Form Data Interface
 * Used for form submission before creating a full Booking object
 */
export interface BookingFormData {
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
}
