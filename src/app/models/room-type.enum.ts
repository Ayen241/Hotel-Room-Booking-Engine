/**
 * Room Type Enum
 * Defines all available room types in the hotel
 */
export enum RoomType {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  SUITE = 'Suite',
  DELUXE = 'Deluxe',
  FAMILY = 'Family'
}

/**
 * Helper function to get all room types as an array
 * @returns Array of all room type values
 */
export function getAllRoomTypes(): string[] {
  return Object.values(RoomType);
}
