import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { BookingService, BookingFormData } from './booking.service';
import { Booking, BookingStatus } from '../models/booking.model';
import { Room } from '../models/room.model';
import { RoomType } from '../models/room-type.enum';
import { API_ENDPOINTS } from '../shared/constants/api.constants';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  const mockRoom: Room = {
    id: '1',
    name: '101',
    type: RoomType.SINGLE,
    price: 100,
    isAvailable: true,
    description: 'Cozy single room'
  };

  const mockFormData: BookingFormData = {
    guestName: 'John Doe',
    checkInDate: '2025-12-10',
    checkOutDate: '2025-12-13'
  };

  const mockBooking: Booking = {
    id: '1',
    roomId: '1',
    roomName: '101',
    roomType: RoomType.SINGLE,
    guestName: 'John Doe',
    checkInDate: '2025-12-10',
    checkOutDate: '2025-12-13',
    totalPrice: 300,
    numberOfNights: 3,
    bookingDate: new Date().toISOString(),
    status: BookingStatus.CONFIRMED
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createBooking', () => {
    it('should create a booking and post to API', () => {
      service.createBooking(mockRoom, mockFormData).subscribe(booking => {
        expect(booking).toBeTruthy();
        expect(booking.guestName).toBe(mockFormData.guestName);
        expect(booking.roomId).toBe(mockRoom.id);
        expect(booking.numberOfNights).toBe(3);
        expect(booking.totalPrice).toBe(300);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.BOOKINGS);
      expect(req.request.method).toBe('POST');
      req.flush(mockBooking);
    });

    it('should save booking to localStorage', () => {
      service.createBooking(mockRoom, mockFormData).subscribe(() => {
        const storedBookings = JSON.parse(localStorage.getItem('hotel_bookings') || '[]');
        expect(storedBookings.length).toBe(1);
        expect(storedBookings[0].guestName).toBe(mockFormData.guestName);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.BOOKINGS);
      req.flush(mockBooking);
    });

    it('should save locally if API fails', () => {
      service.createBooking(mockRoom, mockFormData).subscribe(booking => {
        expect(booking).toBeTruthy();
        expect(booking.id).toContain('local_');
      });

      const req = httpMock.expectOne(API_ENDPOINTS.BOOKINGS);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getBookings', () => {
    it('should fetch bookings from API', () => {
      service.getBookings().subscribe(bookings => {
        expect(bookings.length).toBe(1);
        expect(bookings[0]).toEqual(mockBooking);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.BOOKINGS);
      expect(req.request.method).toBe('GET');
      req.flush([mockBooking]);
    });

    it('should return local bookings if API fails', () => {
      // Add booking to localStorage
      localStorage.setItem('hotel_bookings', JSON.stringify([mockBooking]));

      service.getBookings().subscribe(bookings => {
        expect(bookings.length).toBe(1);
        expect(bookings[0]).toEqual(mockBooking);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.BOOKINGS);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('calculateNumberOfNights', () => {
    it('should calculate number of nights correctly', () => {
      const nights = service.calculateNumberOfNights('2025-12-10', '2025-12-13');
      expect(nights).toBe(3);
    });

    it('should handle same day check-in and check-out', () => {
      const nights = service.calculateNumberOfNights('2025-12-10', '2025-12-10');
      expect(nights).toBe(0);
    });

    it('should handle single night stay', () => {
      const nights = service.calculateNumberOfNights('2025-12-10', '2025-12-11');
      expect(nights).toBe(1);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate total price correctly', () => {
      const total = service.calculateTotalPrice(100, 3);
      expect(total).toBe(300);
    });

    it('should handle zero nights', () => {
      const total = service.calculateTotalPrice(100, 0);
      expect(total).toBe(0);
    });
  });

  describe('isValidDateRange', () => {
    it('should validate future date ranges', () => {
      const isValid = service.isValidDateRange('2025-12-10', '2025-12-13');
      expect(isValid).toBe(true);
    });

    it('should reject past check-in dates', () => {
      const isValid = service.isValidDateRange('2020-12-10', '2020-12-13');
      expect(isValid).toBe(false);
    });

    it('should reject check-out before check-in', () => {
      const isValid = service.isValidDateRange('2025-12-13', '2025-12-10');
      expect(isValid).toBe(false);
    });

    it('should reject same check-in and check-out', () => {
      const isValid = service.isValidDateRange('2025-12-10', '2025-12-10');
      expect(isValid).toBe(false);
    });
  });

  describe('getBookingsByRoomId', () => {
    it('should filter bookings by room ID', () => {
      service['bookingsSubject'].next([mockBooking]);
      
      const bookings = service.getBookingsByRoomId('1');
      expect(bookings.length).toBe(1);
      expect(bookings[0].roomId).toBe('1');
    });

    it('should return empty array for non-existent room', () => {
      service['bookingsSubject'].next([mockBooking]);
      
      const bookings = service.getBookingsByRoomId('999');
      expect(bookings.length).toBe(0);
    });
  });

  describe('getBookingsByGuestName', () => {
    it('should filter bookings by guest name (case-insensitive)', () => {
      service['bookingsSubject'].next([mockBooking]);
      
      const bookings = service.getBookingsByGuestName('john');
      expect(bookings.length).toBe(1);
      expect(bookings[0].guestName).toBe('John Doe');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', () => {
      service['bookingsSubject'].next([mockBooking]);
      
      service.cancelBooking('1').subscribe(booking => {
        expect(booking.status).toBe(BookingStatus.CANCELLED);
      });
    });

    it('should throw error for non-existent booking', () => {
      service.cancelBooking('999').subscribe({
        next: () => {
          throw new Error('should have thrown error');
        },
        error: (error) => {
          expect(error.message).toBe('Booking not found');
        }
      });
    });
  });

  describe('clearAllBookings', () => {
    it('should clear all bookings from memory and storage', () => {
      service['bookingsSubject'].next([mockBooking]);
      localStorage.setItem('hotel_bookings', JSON.stringify([mockBooking]));
      
      service.clearAllBookings();
      
      expect(service.getCurrentBookings().length).toBe(0);
      expect(localStorage.getItem('hotel_bookings')).toBeNull();
    });
  });

  describe('localStorage operations', () => {
    it('should handle localStorage errors gracefully', () => {
      // Spy on localStorage to throw error
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw, should return empty array
      const bookings = service['getBookingsFromStorage']();
      expect(bookings).toEqual([]);
      
      // Restore the original implementation
      vi.restoreAllMocks();
    });
  });
});
