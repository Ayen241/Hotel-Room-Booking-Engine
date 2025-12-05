import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { Booking, BookingStatus } from '../../models/booking.model';

/**
 * BookingHistoryComponent
 * Displays user's booking history with filter and search capabilities
 */
@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ToastComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './booking-history.component.html',
  styleUrl: './booking-history.component.css'
})
export class BookingHistoryComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);
  private toastService = inject(ToastService);
  
  /** Subscriptions to clean up on destroy */
  private subscriptions: Subscription[] = [];
  
  /** All bookings */
  bookings = signal<Booking[]>([]);
  
  /** Filtered bookings */
  filteredBookings = signal<Booking[]>([]);
  
  /** Loading state */
  loading = signal(true);
  
  /** Selected status filter */
  selectedStatus = signal<string>('all');
  
  /** Search query */
  searchQuery = signal('');
  
  /** Sort field */
  sortField = signal<'bookingDate' | 'checkInDate' | 'totalPrice'>('bookingDate');
  
  /** Sort direction */
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  /** Booking status enum for template */
  BookingStatus = BookingStatus;

  ngOnInit(): void {
    this.loadBookings();
    this.subscribeToBookings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load bookings from service
   */
  private loadBookings(): void {
    this.loading.set(true);
    
    const sub = this.bookingService.getBookings().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.toastService.showError('Failed to load bookings. Please try again.', 'Error');
        this.loading.set(false);
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Subscribe to bookings observable
   */
  private subscribeToBookings(): void {
    const sub = this.bookingService.bookings$.subscribe(bookings => {
      this.bookings.set(bookings);
      this.applyFiltersAndSort();
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Apply filters and sorting to bookings
   */
  private applyFiltersAndSort(): void {
    let filtered = [...this.bookings()];
    
    // Filter by status
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(b => b.status === this.selectedStatus());
    }
    
    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(query) ||
        b.roomName.toLowerCase().includes(query) ||
        b.roomType.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query)
      );
    }
    
    // Sort bookings
    filtered.sort((a, b) => {
      const field = this.sortField();
      let comparison = 0;
      
      if (field === 'totalPrice') {
        comparison = a[field] - b[field];
      } else {
        comparison = new Date(a[field]).getTime() - new Date(b[field]).getTime();
      }
      
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
    
    this.filteredBookings.set(filtered);
  }

  /**
   * Handle status filter change
   */
  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.applyFiltersAndSort();
  }

  /**
   * Handle search query change
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFiltersAndSort();
  }

  /**
   * Handle sort field change
   */
  onSortChange(field: 'bookingDate' | 'checkInDate' | 'totalPrice'): void {
    if (this.sortField() === field) {
      // Toggle direction if same field
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
    this.applyFiltersAndSort();
  }

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: string): void {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    // Find the booking to get room ID
    const booking = this.bookings().find(b => b.id === bookingId);
    
    if (!booking) {
      this.toastService.showError('Booking not found.', 'Error');
      return;
    }
    
    const sub = this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        // Update room availability back to available
        this.roomService.updateRoomAvailability(booking.roomId, true).subscribe({
          next: () => {
            this.toastService.showSuccess(
              `Booking cancelled successfully. Room ${booking.roomName} is now available.`, 
              'Cancelled'
            );
          },
          error: (error) => {
            console.error('Error updating room availability:', error);
            this.toastService.showWarning(
              'Booking cancelled but room availability may not be updated. Please refresh the page.',
              'Partial Success'
            );
          }
        });
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        this.toastService.showError('Failed to cancel booking. Please try again.', 'Error');
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFiltersAndSort();
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.selectedStatus.set('all');
    this.searchQuery.set('');
    this.applyFiltersAndSort();
  }

  /**
   * Check if filters are active
   */
  hasActiveFilters(): boolean {
    return this.selectedStatus() !== 'all' || this.searchQuery().trim() !== '';
  }

  /**
   * Refresh bookings
   */
  refreshBookings(): void {
    this.loadBookings();
    this.toastService.showInfo('Refreshing bookings...', 'Refresh');
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]: 'bg-success',
      [BookingStatus.PENDING]: 'bg-warning',
      [BookingStatus.CANCELLED]: 'bg-danger'
    };
    
    return classes[status];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get empty message
   */
  getEmptyMessage(): string {
    if (this.loading()) {
      return 'Loading bookings...';
    }
    
    if (this.bookings().length === 0) {
      return 'You have no bookings yet. Start by booking a room!';
    }
    
    if (this.searchQuery()) {
      return `No bookings found matching "${this.searchQuery()}".`;
    }
    
    if (this.selectedStatus() !== 'all') {
      return `No ${this.selectedStatus()} bookings found.`;
    }
    
    return 'No bookings found.';
  }

  /**
   * Get statistics
   */
  getTotalBookings(): number {
    return this.bookings().length;
  }

  getConfirmedBookings(): number {
    return this.bookings().filter(b => b.status === BookingStatus.CONFIRMED).length;
  }

  getCancelledBookings(): number {
    return this.bookings().filter(b => b.status === BookingStatus.CANCELLED).length;
  }

  getTotalSpent(): number {
    return this.bookings()
      .filter(b => b.status === BookingStatus.CONFIRMED)
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }

  /**
   * Track bookings by ID
   */
  trackByBookingId(index: number, booking: Booking): string {
    return booking.id;
  }

  /**
   * Get sort icon
   */
  getSortIcon(field: string): string {
    if (this.sortField() !== field) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection() === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }
}
