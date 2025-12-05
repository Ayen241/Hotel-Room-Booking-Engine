import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError, of } from 'rxjs';
import { Booking, BookingStatus } from '../models/booking.model';
import { Room } from '../models/room.model';
import { API_ENDPOINTS } from '../shared/constants/api.constants';

/**
 * BookingFormData Interface
 * Represents the data submitted from the booking form
 */
export interface BookingFormData {
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
}

/**
 * BookingService
 * Handles all booking-related operations including creating bookings,
 * managing localStorage persistence, and interacting with the API
 */
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  /** LocalStorage key for storing bookings */
  private readonly STORAGE_KEY = 'hotel_bookings';
  
  /** BehaviorSubject to store and emit bookings data */
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  
  /** Observable stream of bookings for components to subscribe to */
  public bookings$ = this.bookingsSubject.asObservable();

  constructor() {
    // Load bookings from localStorage on service initialization
    this.loadBookingsFromStorage();
  }

  /**
   * Create a new booking
   * @param room - The room being booked
   * @param formData - Booking form data (guest name, dates)
   * @returns Observable of created Booking
   */
  createBooking(room: Room, formData: BookingFormData): Observable<Booking> {
    const numberOfNights = this.calculateNumberOfNights(
      formData.checkInDate,
      formData.checkOutDate
    );
    
    const totalPrice = this.calculateTotalPrice(room.price, numberOfNights);
    
    const newBooking: Omit<Booking, 'id'> = {
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      guestName: formData.guestName,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      totalPrice,
      numberOfNights,
      bookingDate: new Date().toISOString(),
      status: BookingStatus.CONFIRMED
    };

    // Post to API (MockAPI will generate the ID)
    return this.http.post<Booking>(API_ENDPOINTS.BOOKINGS, newBooking).pipe(
      tap(booking => {
        // Save to localStorage and update subject
        this.addBookingToStorage(booking);
      }),
      catchError(error => {
        // If API fails, still save locally with a generated ID
        const localBooking: Booking = {
          ...newBooking,
          id: this.generateLocalId()
        };
        this.addBookingToStorage(localBooking);
        
        console.warn('API booking failed, saved locally:', error);
        return of(localBooking);
      })
    );
  }

  /**
   * Get all bookings from API
   * @returns Observable of Booking array
   */
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(API_ENDPOINTS.BOOKINGS).pipe(
      tap(bookings => {
        // Merge API bookings with local bookings
        const localBookings = this.getBookingsFromStorage();
        const mergedBookings = this.mergeBookings(bookings, localBookings);
        this.bookingsSubject.next(mergedBookings);
      }),
      catchError(error => {
        // If API fails, return local bookings
        console.warn('Failed to fetch bookings from API, using local storage:', error);
        const localBookings = this.getBookingsFromStorage();
        this.bookingsSubject.next(localBookings);
        return of(localBookings);
      })
    );
  }

  /**
   * Get bookings for a specific room
   * @param roomId - The room ID to filter by
   * @returns Array of bookings for the room
   */
  getBookingsByRoomId(roomId: string): Booking[] {
    return this.bookingsSubject.value.filter(booking => booking.roomId === roomId);
  }

  /**
   * Get bookings by guest name
   * @param guestName - The guest name to filter by
   * @returns Array of bookings for the guest
   */
  getBookingsByGuestName(guestName: string): Booking[] {
    return this.bookingsSubject.value.filter(
      booking => booking.guestName.toLowerCase().includes(guestName.toLowerCase())
    );
  }

  /**
   * Cancel a booking
   * @param bookingId - The booking ID to cancel
   * @returns Observable of updated Booking
   */
  cancelBooking(bookingId: string): Observable<Booking> {
    const booking = this.bookingsSubject.value.find(b => b.id === bookingId);
    
    if (!booking) {
      return throwError(() => new Error('Booking not found'));
    }

    const updatedBooking: Booking = {
      ...booking,
      status: BookingStatus.CANCELLED
    };

    // Update in API first
    return this.http.put<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}`, updatedBooking).pipe(
      tap(apiBooking => {
        // Update in storage and subject after successful API update
        this.updateBookingInStorage(apiBooking);
      }),
      catchError(error => {
        // If API fails, still update locally
        console.warn('API update failed, updating locally only:', error);
        this.updateBookingInStorage(updatedBooking);
        return of(updatedBooking);
      })
    );
  }

  /**
   * Calculate number of nights between two dates
   * @param checkIn - Check-in date string (YYYY-MM-DD)
   * @param checkOut - Check-out date string (YYYY-MM-DD)
   * @returns Number of nights
   */
  calculateNumberOfNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Calculate total price for a booking
   * @param pricePerNight - Price per night
   * @param numberOfNights - Number of nights
   * @returns Total price
   */
  calculateTotalPrice(pricePerNight: number, numberOfNights: number): number {
    return pricePerNight * numberOfNights;
  }

  /**
   * Check if a date range is valid
   * @param checkIn - Check-in date string
   * @param checkOut - Check-out date string
   * @returns True if valid, false otherwise
   */
  isValidDateRange(checkIn: string, checkOut: string): boolean {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkInDate >= today && checkOutDate > checkInDate;
  }

  /**
   * Load bookings from localStorage
   */
  private loadBookingsFromStorage(): void {
    const bookings = this.getBookingsFromStorage();
    this.bookingsSubject.next(bookings);
  }

  /**
   * Get bookings from localStorage
   * @returns Array of bookings
   */
  private getBookingsFromStorage(): Booking[] {
    if (!this.isBrowser) {
      return [];
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Save bookings to localStorage
   * @param bookings - Array of bookings to save
   */
  private saveBookingsToStorage(bookings: Booking[]): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Add a booking to storage and update subject
   * @param booking - The booking to add
   */
  private addBookingToStorage(booking: Booking): void {
    const currentBookings = this.bookingsSubject.value;
    const updatedBookings = [...currentBookings, booking];
    this.bookingsSubject.next(updatedBookings);
    this.saveBookingsToStorage(updatedBookings);
  }

  /**
   * Update a booking in storage
   * @param booking - The updated booking
   */
  private updateBookingInStorage(booking: Booking): void {
    const currentBookings = this.bookingsSubject.value;
    const index = currentBookings.findIndex(b => b.id === booking.id);
    
    if (index !== -1) {
      currentBookings[index] = booking;
      this.bookingsSubject.next([...currentBookings]);
      this.saveBookingsToStorage(currentBookings);
    }
  }

  /**
   * Merge API bookings with local bookings (avoiding duplicates)
   * API bookings take priority over local bookings for the same ID
   * Only preserves local-only bookings (those with 'local_' prefix that haven't been synced to API yet)
   * @param apiBookings - Bookings from API
   * @param localBookings - Bookings from localStorage
   * @returns Merged array of bookings
   */
  private mergeBookings(apiBookings: Booking[], localBookings: Booking[]): Booking[] {
    // Start with API bookings as they are the source of truth
    const merged = [...apiBookings];
    
    // Only add local bookings that:
    // 1. Don't exist in API response
    // 2. Have a local ID (start with 'local_'), meaning they were created offline
    // This prevents deleted API bookings from being re-added from localStorage
    localBookings.forEach(localBooking => {
      const existsInApi = merged.find(b => b.id === localBooking.id);
      const isLocalOnly = localBooking.id.startsWith('local_');
      
      if (!existsInApi && isLocalOnly) {
        merged.push(localBooking);
      }
    });
    
    // Save merged results to localStorage to keep it in sync
    this.saveBookingsToStorage(merged);
    
    return merged;
  }

  /**
   * Generate a local ID for bookings when API is unavailable
   * @returns Generated ID string
   */
  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get current bookings value (synchronous)
   * @returns Current array of bookings
   */
  getCurrentBookings(): Booking[] {
    return this.bookingsSubject.value;
  }

  /**
   * Clear all bookings (useful for testing)
   */
  clearAllBookings(): void {
    this.bookingsSubject.next([]);
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
