import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError, map } from 'rxjs';
import { Room } from '../models/room.model';
import { RoomType } from '../models/room-type.enum';
import { API_ENDPOINTS } from '../shared/constants/api.constants';

/**
 * RoomService
 * Handles all room-related operations including fetching rooms from API
 * and managing room availability
 */
@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  
  /** BehaviorSubject to store and emit rooms data */
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  
  /** Observable stream of rooms for components to subscribe to */
  public rooms$ = this.roomsSubject.asObservable();
  
  /** Loading state subject */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  /** Observable loading state */
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Fetch all rooms from the API
   * Updates the rooms$ observable with fetched data
   * @returns Observable of Room array
   */
  getRooms(): Observable<Room[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<Room[]>(API_ENDPOINTS.ROOMS).pipe(
      tap(rooms => {
        this.roomsSubject.next(rooms);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get a single room by ID
   * @param roomId - The unique identifier of the room
   * @returns Observable of Room
   */
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${API_ENDPOINTS.ROOMS}/${roomId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update room availability after booking or cancellation
   * @param roomId - The unique identifier of the room
   * @param isAvailable - New availability status
   * @returns Observable of updated Room
   */
  updateRoomAvailability(roomId: string, isAvailable: boolean): Observable<Room> {
    // First, get the current room data from local state
    const currentRoom = this.roomsSubject.value.find(r => r.id === roomId);
    
    if (!currentRoom) {
      return throwError(() => new Error('Room not found'));
    }
    
    // Update with the full room object (MockAPI requires complete object for PUT)
    const updatedRoom = { ...currentRoom, isAvailable };
    
    return this.http.put<Room>(`${API_ENDPOINTS.ROOMS}/${roomId}`, updatedRoom).pipe(
      tap(apiRoom => {
        // Update the local rooms array with the API response
        const currentRooms = this.roomsSubject.value;
        const index = currentRooms.findIndex(r => r.id === roomId);
        
        if (index !== -1) {
          currentRooms[index] = { ...currentRooms[index], ...apiRoom };
          this.roomsSubject.next([...currentRooms]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Filter rooms by type
   * @param roomType - The type of room to filter by (or 'All' for no filter)
   * @returns Observable of filtered Room array
   */
  filterRoomsByType(roomType: string): Observable<Room[]> {
    return this.rooms$.pipe(
      map(rooms => {
        if (roomType === 'All') {
          return rooms;
        }
        return rooms.filter(room => room.type === roomType);
      })
    );
  }

  /**
   * Get only available rooms
   * @returns Observable of available Room array
   */
  getAvailableRooms(): Observable<Room[]> {
    return this.rooms$.pipe(
      map(rooms => rooms.filter(room => room.isAvailable))
    );
  }

  /**
   * Get rooms by price range
   * @param minPrice - Minimum price per night
   * @param maxPrice - Maximum price per night
   * @returns Observable of filtered Room array
   */
  getRoomsByPriceRange(minPrice: number, maxPrice: number): Observable<Room[]> {
    return this.rooms$.pipe(
      map(rooms => rooms.filter(room => room.price >= minPrice && room.price <= maxPrice))
    );
  }

  /**
   * Get current rooms value (synchronous)
   * @returns Current array of rooms
   */
  getCurrentRooms(): Room[] {
    return this.roomsSubject.value;
  }

  /**
   * Get all unique room types from current rooms
   * @returns Array of unique room types
   */
  getUniqueRoomTypes(): string[] {
    const rooms = this.getCurrentRooms();
    const types = rooms.map(room => room.type);
    return ['All', ...Array.from(new Set(types))];
  }

  /**
   * Error handler for HTTP requests
   * @param error - HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }
    
    console.error('RoomService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
