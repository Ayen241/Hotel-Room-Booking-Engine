import { RoomType } from './room-type.enum';

/**
 * Room Interface
 * Represents a hotel room with all its properties
 */
export interface Room {
  /** Unique identifier from MockAPI */
  id: string;
  
  /** Room number (e.g., "101", "102", "201") */
  name: string;
  
  /** Type of room (Single, Double, Suite, etc.) */
  type: RoomType;
  
  /** Price per night in dollars */
  price: number;
  
  /** Current availability status */
  isAvailable: boolean;
  
  /** Optional room description */
  description?: string;
  
  /** Optional room image URL */
  imageUrl?: string;
  
  /** Optional list of amenities */
  amenities?: string[];
  
  /** Optional maximum guest capacity */
  capacity?: number;
}
