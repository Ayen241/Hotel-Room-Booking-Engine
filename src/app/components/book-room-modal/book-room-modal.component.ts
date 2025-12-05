import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Room } from '../../models/room.model';
import { BookingFormData } from '../../services/booking.service';

/**
 * BookRoomModalComponent
 * Modal dialog for booking a room with form validation
 */
@Component({
  selector: 'app-book-room-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-room-modal.component.html',
  styleUrl: './book-room-modal.component.css'
})
export class BookRoomModalComponent implements OnInit, OnChanges {
  /** Room to be booked */
  @Input({ required: true }) room!: Room;
  
  /** Modal visibility state */
  @Input() isVisible = false;
  
  /** Event emitted when booking form is submitted */
  @Output() bookingSubmit = new EventEmitter<BookingFormData>();
  
  /** Event emitted when modal is closed */
  @Output() modalClose = new EventEmitter<void>();

  /** Booking form */
  bookingForm!: FormGroup;
  
  /** Minimum date for date inputs (today) */
  minDate = signal('');
  
  /** Calculated number of nights */
  numberOfNights = signal(0);
  
  /** Calculated total price */
  totalPrice = signal(0);
  
  /** Form submission state */
  isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setMinDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && !changes['isVisible'].currentValue) {
      this.resetForm();
    }
  }

  /**
   * Initialize the booking form with validators
   */
  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      guestName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s'-]+$/)
      ]],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required]
    }, {
      validators: [this.dateRangeValidator, this.minDateValidator]
    });

    // Subscribe to date changes to calculate nights and price
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateBookingDetails();
    });
  }

  /**
   * Set minimum date to today
   */
  private setMinDate(): void {
    const today = new Date();
    this.minDate.set(today.toISOString().split('T')[0]);
  }

  /**
   * Custom validator to ensure check-out is after check-in
   */
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const checkIn = control.get('checkInDate')?.value;
    const checkOut = control.get('checkOutDate')?.value;
    
    if (checkIn && checkOut && checkOut <= checkIn) {
      return { dateRange: true };
    }
    
    return null;
  }

  /**
   * Custom validator to ensure check-in is not in the past
   */
  private minDateValidator(control: AbstractControl): ValidationErrors | null {
    const checkIn = control.get('checkInDate')?.value;
    
    if (checkIn) {
      const checkInDate = new Date(checkIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        return { pastDate: true };
      }
    }
    
    return null;
  }

  /**
   * Calculate number of nights and total price
   */
  private calculateBookingDetails(): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    if (checkIn && checkOut && checkOut > checkIn) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      this.numberOfNights.set(nights);
      this.totalPrice.set(nights * this.room.price);
    } else {
      this.numberOfNights.set(0);
      this.totalPrice.set(0);
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.bookingForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formData: BookingFormData = {
        guestName: this.bookingForm.get('guestName')?.value.trim(),
        checkInDate: this.bookingForm.get('checkInDate')?.value,
        checkOutDate: this.bookingForm.get('checkOutDate')?.value
      };
      
      this.bookingSubmit.emit(formData);
      
      // Reset submitting state after a short delay
      setTimeout(() => {
        this.isSubmitting.set(false);
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.bookingForm);
    }
  }

  /**
   * Mark all form controls as touched to trigger validation display
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Close the modal
   */
  close(): void {
    this.modalClose.emit();
    this.resetForm();
  }

  /**
   * Reset the form to initial state
   */
  private resetForm(): void {
    this.bookingForm.reset();
    this.numberOfNights.set(0);
    this.totalPrice.set(0);
    this.isSubmitting.set(false);
  }

  /**
   * Check if a form control has an error and has been touched
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.bookingForm.get(controlName);
    return !!(control?.hasError(errorName) && control?.touched);
  }

  /**
   * Check if form has a specific error
   */
  hasFormError(errorName: string): boolean {
    return !!(this.bookingForm.hasError(errorName) && this.bookingForm.touched);
  }

  /**
   * Get error message for a control
   */
  getErrorMessage(controlName: string): string {
    const control = this.bookingForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${this.getControlLabel(controlName)} is required`;
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getControlLabel(controlName)} must be at least ${minLength} characters`;
    }
    
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getControlLabel(controlName)} must not exceed ${maxLength} characters`;
    }
    
    if (control?.hasError('pattern')) {
      return `${this.getControlLabel(controlName)} contains invalid characters`;
    }
    
    return '';
  }

  /**
   * Get form-level error message
   */
  getFormErrorMessage(): string {
    if (this.bookingForm.hasError('dateRange')) {
      return 'Check-out date must be after check-in date';
    }
    
    if (this.bookingForm.hasError('pastDate')) {
      return 'Check-in date cannot be in the past';
    }
    
    return '';
  }

  /**
   * Get user-friendly label for control name
   */
  private getControlLabel(controlName: string): string {
    const labels: Record<string, string> = {
      guestName: 'Guest name',
      checkInDate: 'Check-in date',
      checkOutDate: 'Check-out date'
    };
    
    return labels[controlName] || controlName;
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.close();
    }
  }
}
