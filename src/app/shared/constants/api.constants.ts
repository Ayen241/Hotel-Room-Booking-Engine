/**
 * API Constants
 * Central location for all API-related configuration
 */

/**
 * Base URL for MockAPI endpoints
 */
export const API_BASE_URL = 'https://6932963ae5a9e342d26fd8e9.mockapi.io';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  /** Rooms endpoint for fetching and updating room data */
  ROOMS: `${API_BASE_URL}/rooms`,
  
  /** Bookings endpoint for creating and fetching bookings */
  BOOKINGS: `${API_BASE_URL}/bookings`
} as const;

/**
 * LocalStorage Keys
 */
export const STORAGE_KEYS = {
  /** Key for storing bookings in localStorage */
  BOOKINGS: 'hotel_bookings'
} as const;
