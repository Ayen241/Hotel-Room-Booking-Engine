import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Toast Type Enum
 * Defines the types of toast notifications
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Toast Interface
 * Represents a toast notification with its properties
 */
export interface Toast {
  /** Unique identifier for the toast */
  id: string;
  
  /** Type of toast (determines styling) */
  type: ToastType;
  
  /** Toast message content */
  message: string;
  
  /** Optional toast title */
  title?: string;
  
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration: number;
  
  /** Timestamp when toast was created */
  timestamp: number;
}

/**
 * ToastService
 * Manages toast notifications throughout the application
 * Provides methods to show, hide, and manage toast messages
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** Default duration for toast messages (in milliseconds) */
  private readonly DEFAULT_DURATION = 3000;
  
  /** Maximum number of toasts to display at once */
  private readonly MAX_TOASTS = 5;
  
  /** BehaviorSubject to store and emit toast messages */
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  
  /** Observable stream of toasts for components to subscribe to */
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  /**
   * Show a success toast message
   * @param message - The message to display
   * @param title - Optional title for the toast
   * @param duration - Optional duration in milliseconds
   */
  showSuccess(message: string, title?: string, duration?: number): void {
    this.show(ToastType.SUCCESS, message, title, duration);
  }

  /**
   * Show an error toast message
   * @param message - The message to display
   * @param title - Optional title for the toast
   * @param duration - Optional duration in milliseconds (0 = no auto-dismiss)
   */
  showError(message: string, title?: string, duration?: number): void {
    this.show(ToastType.ERROR, message, title, duration);
  }

  /**
   * Show a warning toast message
   * @param message - The message to display
   * @param title - Optional title for the toast
   * @param duration - Optional duration in milliseconds
   */
  showWarning(message: string, title?: string, duration?: number): void {
    this.show(ToastType.WARNING, message, title, duration);
  }

  /**
   * Show an info toast message
   * @param message - The message to display
   * @param title - Optional title for the toast
   * @param duration - Optional duration in milliseconds
   */
  showInfo(message: string, title?: string, duration?: number): void {
    this.show(ToastType.INFO, message, title, duration);
  }

  /**
   * Generic method to show a toast
   * @param type - Type of toast
   * @param message - The message to display
   * @param title - Optional title for the toast
   * @param duration - Optional duration in milliseconds
   */
  private show(
    type: ToastType,
    message: string,
    title?: string,
    duration?: number
  ): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      title,
      duration: duration ?? this.DEFAULT_DURATION,
      timestamp: Date.now()
    };

    const currentToasts = this.toastsSubject.value;
    
    // Limit the number of toasts
    const updatedToasts = [toast, ...currentToasts].slice(0, this.MAX_TOASTS);
    
    this.toastsSubject.next(updatedToasts);

    // Auto-dismiss if duration is set
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Remove a specific toast by ID
   * @param id - The ID of the toast to remove
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Remove all toasts
   */
  removeAll(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Get current toasts (synchronous)
   * @returns Current array of toasts
   */
  getCurrentToasts(): Toast[] {
    return this.toastsSubject.value;
  }

  /**
   * Generate a unique ID for toasts
   * @returns Generated ID string
   */
  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Show a booking success message (convenience method)
   * @param roomName - Name of the booked room
   * @param guestName - Name of the guest
   */
  showBookingSuccess(roomName: string, guestName: string): void {
    this.showSuccess(
      `Room ${roomName} has been successfully booked for ${guestName}!`,
      '🎉 Booking Confirmed'
    );
  }

  /**
   * Show a booking error message (convenience method)
   * @param errorMessage - The error message to display
   */
  showBookingError(errorMessage: string): void {
    this.showError(
      errorMessage || 'An error occurred while processing your booking. Please try again.',
      '❌ Booking Failed'
    );
  }

  /**
   * Show a loading message (info toast)
   * @param message - The loading message
   * @returns Toast ID (can be used to remove it later)
   */
  showLoading(message: string = 'Loading...'): string {
    const toast: Toast = {
      id: this.generateId(),
      type: ToastType.INFO,
      message,
      duration: 0, // Don't auto-dismiss
      timestamp: Date.now()
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([toast, ...currentToasts]);
    
    return toast.id;
  }
}
