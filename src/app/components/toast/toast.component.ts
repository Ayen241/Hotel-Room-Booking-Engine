import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast, ToastType } from '../../services/toast.service';

/**
 * ToastComponent
 * Displays toast notifications in the top-right corner of the screen
 * Automatically subscribes to the ToastService and displays active toasts
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private subscription?: Subscription;

  /** Array of active toasts */
  toasts: Toast[] = [];

  ngOnInit(): void {
    // Subscribe to toast service
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.subscription?.unsubscribe();
  }

  /**
   * Remove a toast
   * @param toastId - ID of the toast to remove
   */
  removeToast(toastId: string): void {
    this.toastService.remove(toastId);
  }

  /**
   * Get CSS classes for a toast based on its type
   * @param toast - The toast object
   * @returns CSS class string
   */
  getToastClasses(toast: Toast): string {
    const baseClasses = 'toast show';
    const typeClass = `toast-${toast.type}`;
    return `${baseClasses} ${typeClass}`;
  }

  /**
   * Get icon class for a toast based on its type
   * @param type - Toast type
   * @returns Bootstrap icon class
   */
  getIconClass(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      [ToastType.SUCCESS]: 'bi-check-circle-fill',
      [ToastType.ERROR]: 'bi-exclamation-circle-fill',
      [ToastType.WARNING]: 'bi-exclamation-triangle-fill',
      [ToastType.INFO]: 'bi-info-circle-fill'
    };
    
    return icons[type];
  }

  /**
   * Get default title for a toast type if no title is provided
   * @param type - Toast type
   * @returns Default title string
   */
  getDefaultTitle(type: ToastType): string {
    const titles: Record<ToastType, string> = {
      [ToastType.SUCCESS]: 'Success',
      [ToastType.ERROR]: 'Error',
      [ToastType.WARNING]: 'Warning',
      [ToastType.INFO]: 'Info'
    };
    
    return titles[type];
  }

  /**
   * Get the title to display for a toast
   * @param toast - The toast object
   * @returns Title string
   */
  getToastTitle(toast: Toast): string {
    return toast.title || this.getDefaultTitle(toast.type);
  }

  /**
   * Get time elapsed since toast was created (for display)
   * @param timestamp - Toast creation timestamp
   * @returns Time string (e.g., "just now", "2 mins ago")
   */
  getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 10) {
      return 'just now';
    } else if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }
  }

  /**
   * Track toasts by their ID for better performance with ngFor
   * @param index - Array index
   * @param toast - Toast object
   * @returns Unique identifier
   */
  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }
}
