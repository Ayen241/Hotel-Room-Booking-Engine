import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoomCardComponent } from '../../components/room-card/room-card.component';
import { BookRoomModalComponent } from '../../components/book-room-modal/book-room-modal.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { RoomService } from '../../services/room.service';
import { BookingService, BookingFormData } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { Room } from '../../models/room.model';
import { RoomType } from '../../models/room-type.enum';

/**
 * RoomListComponent
 * Main page component that displays all available rooms
 * Handles room filtering, booking modal, and notifications
 */
@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RoomCardComponent,
    BookRoomModalComponent,
    ToastComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent implements OnInit, OnDestroy {
  private roomService = inject(RoomService);
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);
  
  /** Subscriptions to clean up on destroy */
  private subscriptions: Subscription[] = [];
  
  /** All rooms from the service */
  rooms = signal<Room[]>([]);
  
  /** Filtered rooms based on selected type */
  filteredRooms = signal<Room[]>([]);
  
  /** Loading state */
  loading = signal(false);
  
  /** Available room types for filter dropdown */
  roomTypes = signal<string[]>(['All']);
  
  /** Selected room type filter */
  selectedRoomType = signal('All');
  
  /** Search query for filtering by room name */
  searchQuery = signal('');
  
  /** Modal visibility state */
  isModalVisible = signal(false);
  
  /** Room currently being booked */
  selectedRoom = signal<Room | null>(null);
  
  /** Statistics */
  totalRooms = signal(0);
  availableRooms = signal(0);
  bookedRooms = signal(0);

  ngOnInit(): void {
    this.loadRooms();
    this.subscribeToRooms();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load rooms from the API
   */
  private loadRooms(): void {
    const sub = this.roomService.getRooms().subscribe({
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.toastService.showError('Failed to load rooms. Please try again.', 'Error');
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Subscribe to rooms observable to get updates
   */
  private subscribeToRooms(): void {
    const sub = this.roomService.rooms$.subscribe(rooms => {
      this.rooms.set(rooms);
      this.updateStatistics(rooms);
      this.updateRoomTypes(rooms);
      this.applyFilters();
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Subscribe to loading state
   */
  private subscribeToLoading(): void {
    const sub = this.roomService.loading$.subscribe(loading => {
      this.loading.set(loading);
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Update room statistics
   */
  private updateStatistics(rooms: Room[]): void {
    this.totalRooms.set(rooms.length);
    this.availableRooms.set(rooms.filter(r => r.isAvailable).length);
    this.bookedRooms.set(rooms.filter(r => !r.isAvailable).length);
  }

  /**
   * Update available room types for filter
   */
  private updateRoomTypes(rooms: Room[]): void {
    const types = ['All', ...new Set(rooms.map(r => r.type))];
    this.roomTypes.set(types);
  }

  /**
   * Apply filters to rooms based on selected type and search query
   */
  private applyFilters(): void {
    let filtered = this.rooms();
    
    // Filter by room type
    if (this.selectedRoomType() !== 'All') {
      filtered = filtered.filter(room => room.type === this.selectedRoomType());
    }
    
    // Filter by search query (room name)
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query)
      );
    }
    
    this.filteredRooms.set(filtered);
  }

  /**
   * Handle room type filter change
   */
  onRoomTypeChange(type: string): void {
    this.selectedRoomType.set(type);
    this.applyFilters();
  }

  /**
   * Handle search query change
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  /**
   * Handle book room button click
   */
  onBookRoom(room: Room): void {
    if (!room.isAvailable) {
      this.toastService.showWarning('This room is not available for booking.', 'Unavailable');
      return;
    }
    
    this.selectedRoom.set(room);
    this.isModalVisible.set(true);
  }

  /**
   * Handle modal close
   */
  onModalClose(): void {
    this.isModalVisible.set(false);
    this.selectedRoom.set(null);
  }

  /**
   * Handle booking submission
   */
  onBookingSubmit(formData: BookingFormData): void {
    const room = this.selectedRoom();
    
    if (!room) {
      this.toastService.showError('No room selected for booking.', 'Error');
      return;
    }

    // Create the booking
    const sub = this.bookingService.createBooking(room, formData).subscribe({
      next: (booking) => {
        // Update room availability
        this.roomService.updateRoomAvailability(room.id, false).subscribe({
          next: () => {
            this.toastService.showBookingSuccess(room.name, formData.guestName);
            this.onModalClose();
          },
          error: (error) => {
            console.error('Error updating room availability:', error);
            // Booking was created but room status update failed
            this.toastService.showWarning(
              'Booking created but room status may not be updated. Please refresh the page.',
              'Partial Success'
            );
            this.onModalClose();
          }
        });
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.toastService.showBookingError('Failed to create booking. Please try again.');
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Clear search filter
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.selectedRoomType.set('All');
    this.searchQuery.set('');
    this.applyFilters();
  }

  /**
   * Get display message for empty results
   */
  getEmptyMessage(): string {
    if (this.loading()) {
      return 'Loading rooms...';
    }
    
    if (this.rooms().length === 0) {
      return 'No rooms available at the moment. Please check back later.';
    }
    
    if (this.searchQuery()) {
      return `No rooms found matching "${this.searchQuery()}". Try a different search.`;
    }
    
    if (this.selectedRoomType() !== 'All') {
      return `No ${this.selectedRoomType()} rooms available. Try selecting a different room type.`;
    }
    
    return 'No rooms available.';
  }

  /**
   * Check if filters are active
   */
  hasActiveFilters(): boolean {
    return this.selectedRoomType() !== 'All' || this.searchQuery().trim() !== '';
  }

  /**
   * Refresh room list
   */
  refreshRooms(): void {
    this.loadRooms();
    this.toastService.showInfo('Refreshing room list...', 'Refresh');
  }

  /**
   * Track rooms by ID for better performance with ngFor
   */
  trackByRoomId(index: number, room: Room): string {
    return room.id;
  }
}
