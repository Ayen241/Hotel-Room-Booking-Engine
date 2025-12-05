import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingSpinnerComponent
 * Displays a loading spinner with optional message
 * Can be used as overlay or inline
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent {
  /** Loading message to display */
  @Input() message = 'Loading...';

  /** Size of the spinner (small, medium, large) */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /** Whether to show as full-page overlay */
  @Input() overlay = false;

  /** Spinner color variant */
  @Input() variant: 'primary' | 'secondary' | 'light' | 'dark' = 'primary';

  /**
   * Get spinner size class
   * @returns CSS class for spinner size
   */
  getSpinnerSizeClass(): string {
    const sizeClasses: Record<string, string> = {
      small: 'spinner-sm',
      medium: 'spinner-md',
      large: 'spinner-lg'
    };
    
    return sizeClasses[this.size] || sizeClasses['medium'];
  }

  /**
   * Get spinner color class
   * @returns Bootstrap spinner color class
   */
  getSpinnerColorClass(): string {
    return `text-${this.variant}`;
  }

  /**
   * Get container class
   * @returns CSS class for container
   */
  getContainerClass(): string {
    return this.overlay ? 'spinner-overlay' : 'spinner-inline';
  }
}
