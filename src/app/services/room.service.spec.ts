import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { RoomService } from './room.service';
import { Room } from '../models/room.model';
import { RoomType } from '../models/room-type.enum';
import { API_ENDPOINTS } from '../shared/constants/api.constants';

describe('RoomService', () => {
  let service: RoomService;
  let httpMock: HttpTestingController;

  const mockRooms: Room[] = [
    {
      id: '1',
      name: '101',
      type: RoomType.SINGLE,
      price: 100,
      isAvailable: true,
      description: 'Cozy single room',
      capacity: 1
    },
    {
      id: '2',
      name: '102',
      type: RoomType.DOUBLE,
      price: 150,
      isAvailable: true,
      description: 'Spacious double room',
      capacity: 2
    },
    {
      id: '3',
      name: '201',
      type: RoomType.SUITE,
      price: 300,
      isAvailable: false,
      description: 'Luxury suite',
      capacity: 4
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoomService]
    });
    service = TestBed.inject(RoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRooms', () => {
    it('should fetch rooms from API and update rooms$ observable', () => {
      service.getRooms().subscribe(rooms => {
        expect(rooms).toEqual(mockRooms);
        expect(rooms.length).toBe(3);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ROOMS);
      expect(req.request.method).toBe('GET');
      req.flush(mockRooms);
    });

    it('should set loading state correctly', () => {
      const loadingStates: boolean[] = [];

      service.loading$.subscribe(loading => {
        loadingStates.push(loading);
      });

      service.getRooms().subscribe(() => {
        expect(loadingStates).toContain(true);
        expect(loadingStates).toContain(false);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ROOMS);
      req.flush(mockRooms);
    });

    it('should handle HTTP errors', () => {
      service.getRooms().subscribe({
        next: () => {
          throw new Error('should have failed with 500 error');
        },
        error: (error) => {
          expect(error.message).toContain('Server Error');
        }
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ROOMS);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getRoomById', () => {
    it('should fetch a single room by ID', () => {
      const roomId = '1';
      service.getRoomById(roomId).subscribe(room => {
        expect(room).toEqual(mockRooms[0]);
        expect(room.id).toBe(roomId);
      });

      const req = httpMock.expectOne(`${API_ENDPOINTS.ROOMS}/${roomId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRooms[0]);
    });
  });

  describe('updateRoomAvailability', () => {
    it('should update room availability via PUT request', () => {
      const roomId = '1';
      const updatedRoom = { ...mockRooms[0], isAvailable: false };

      // First, set up initial rooms
      service['roomsSubject'].next([...mockRooms]);

      service.updateRoomAvailability(roomId, false).subscribe(room => {
        expect(room.isAvailable).toBe(false);
      });

      const req = httpMock.expectOne(`${API_ENDPOINTS.ROOMS}/${roomId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ isAvailable: false });
      req.flush(updatedRoom);
    });

    it('should update local rooms array after API call', () => {
      const roomId = '1';
      const updatedRoom = { ...mockRooms[0], isAvailable: false };

      service['roomsSubject'].next([...mockRooms]);

      service.updateRoomAvailability(roomId, false).subscribe(() => {
        const currentRooms = service.getCurrentRooms();
        const room = currentRooms.find(r => r.id === roomId);
        expect(room?.isAvailable).toBe(false);
      });

      const req = httpMock.expectOne(`${API_ENDPOINTS.ROOMS}/${roomId}`);
      req.flush(updatedRoom);
    });
  });

  describe('filterRoomsByType', () => {
    beforeEach(() => {
      service['roomsSubject'].next([...mockRooms]);
    });

    it('should filter rooms by type', () => {
      service.filterRoomsByType(RoomType.SINGLE).subscribe(rooms => {
        expect(rooms.length).toBe(1);
        expect(rooms[0].type).toBe(RoomType.SINGLE);
      });
    });

    it('should return all rooms when type is "All"', () => {
      service.filterRoomsByType('All').subscribe(rooms => {
        expect(rooms.length).toBe(3);
      });
    });
  });

  describe('getAvailableRooms', () => {
    it('should return only available rooms', () => {
      service['roomsSubject'].next([...mockRooms]);

      service.getAvailableRooms().subscribe(rooms => {
        expect(rooms.length).toBe(2);
        expect(rooms.every(room => room.isAvailable)).toBe(true);
      });
    });
  });

  describe('getRoomsByPriceRange', () => {
    it('should filter rooms by price range', () => {
      service['roomsSubject'].next([...mockRooms]);

      service.getRoomsByPriceRange(100, 150).subscribe(rooms => {
        expect(rooms.length).toBe(2);
        expect(rooms.every(room => room.price >= 100 && room.price <= 150)).toBe(true);
      });
    });
  });

  describe('getUniqueRoomTypes', () => {
    it('should return unique room types including "All"', () => {
      service['roomsSubject'].next([...mockRooms]);

      const types = service.getUniqueRoomTypes();
      expect(types).toContain('All');
      expect(types).toContain(RoomType.SINGLE);
      expect(types).toContain(RoomType.DOUBLE);
      expect(types).toContain(RoomType.SUITE);
      expect(types.length).toBe(4);
    });
  });

  describe('getCurrentRooms', () => {
    it('should return current rooms synchronously', () => {
      service['roomsSubject'].next([...mockRooms]);

      const rooms = service.getCurrentRooms();
      expect(rooms).toEqual(mockRooms);
    });
  });
});
