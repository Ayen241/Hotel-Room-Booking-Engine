import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../models/room.model';

/**
 * RoomCardComponent
 * Displays a single room with its details in a card format
 * Emits events when the book button is clicked
 */
@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.css'
})
export class RoomCardComponent {
  /** Room data to display */
  @Input({ required: true }) room!: Room;

  /** Event emitted when book button is clicked */
  @Output() bookRoom = new EventEmitter<Room>();

  /**
   * Handle book button click
   * Emits the room to parent component
   */
  onBookClick(): void {
    if (this.room.isAvailable) {
      this.bookRoom.emit(this.room);
    }
  }

  /**
   * Get badge class based on room availability
   * @returns CSS class for availability badge
   */
  getAvailabilityBadgeClass(): string {
    return this.room.isAvailable ? 'bg-success' : 'bg-danger';
  }

  /**
   * Get availability text
   * @returns Availability status text
   */
  getAvailabilityText(): string {
    return this.room.isAvailable ? 'Available' : 'Booked';
  }

  /**
   * Get room image URL or placeholder
   * @returns Image URL
   */
  getRoomImage(): string {
    return this.room.imageUrl || `https://via.placeholder.com/400x250/0d6efd/ffffff?text=Room+${this.room.name}`;
  }

  /**
   * Format amenities for display
   * @returns Formatted amenities string
   */
  getAmenitiesText(): string {
    if (!this.room.amenities || this.room.amenities.length === 0) {
      return 'Standard amenities';
    }
    return this.room.amenities.slice(0, 3).join(' • ');
  }

  /**
   * Check if room has more amenities to show
   * @returns True if there are more than 3 amenities
   */
  hasMoreAmenities(): boolean {
    return (this.room.amenities?.length || 0) > 3;
  }

  /**
   * Get remaining amenities count
   * @returns Number of additional amenities
   */
  getRemainingAmenitiesCount(): number {
    return (this.room.amenities?.length || 0) - 3;
  }
}
