import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService, ToastType, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    // Clean up any remaining toasts
    service.removeAll();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showSuccess', () => {
    it('should add a success toast', () => {
      service.showSuccess('Success message', 'Success Title');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts.length).toBe(1);
          expect(toasts[0].type).toBe(ToastType.SUCCESS);
          expect(toasts[0].message).toBe('Success message');
          expect(toasts[0].title).toBe('Success Title');
        }
      });
    });

    it('should auto-dismiss after duration', () => {
      return new Promise<void>((resolve) => {
        service.showSuccess('Test', undefined, 100);

        setTimeout(() => {
          const toasts = service.getCurrentToasts();
          expect(toasts.length).toBe(0);
          resolve();
        }, 150);
      });
    });
  });

  describe('showError', () => {
    it('should add an error toast', () => {
      service.showError('Error message', 'Error Title');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts.length).toBe(1);
          expect(toasts[0].type).toBe(ToastType.ERROR);
          expect(toasts[0].message).toBe('Error message');
          expect(toasts[0].duration).toBe(0); // Errors don't auto-dismiss by default
        }
      });
    });
  });

  describe('showWarning', () => {
    it('should add a warning toast', () => {
      service.showWarning('Warning message');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe(ToastType.WARNING);
        }
      });
    });
  });

  describe('showInfo', () => {
    it('should add an info toast', () => {
      service.showInfo('Info message');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe(ToastType.INFO);
        }
      });
    });
  });

  describe('remove', () => {
    it('should remove a specific toast by ID', () => {
      service.showInfo('Test message', undefined, 0);

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          const toastId = toasts[0].id;
          service.remove(toastId);

          setTimeout(() => {
            const remainingToasts = service.getCurrentToasts();
            expect(remainingToasts.length).toBe(0);
          }, 10);
        }
      });
    });
  });

  describe('removeAll', () => {
    it('should remove all toasts', () => {
      service.showSuccess('Message 1', undefined, 0);
      service.showError('Message 2', undefined, 0);
      service.showWarning('Message 3', undefined, 0);

      service.removeAll();

      const toasts = service.getCurrentToasts();
      expect(toasts.length).toBe(0);
    });
  });

  describe('maximum toasts limit', () => {
    it('should limit the number of toasts to MAX_TOASTS', () => {
      // Add 10 toasts (MAX_TOASTS is 5)
      for (let i = 0; i < 10; i++) {
        service.showInfo(`Message ${i}`, undefined, 0);
      }

      const toasts = service.getCurrentToasts();
      expect(toasts.length).toBe(5);
    });

    it('should keep the most recent toasts', () => {
      for (let i = 0; i < 10; i++) {
        service.showInfo(`Message ${i}`, undefined, 0);
      }

      const toasts = service.getCurrentToasts();
      expect(toasts[0].message).toBe('Message 9'); // Most recent first
    });
  });

  describe('showBookingSuccess', () => {
    it('should show a formatted booking success message', () => {
      service.showBookingSuccess('Room 101', 'John Doe');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe(ToastType.SUCCESS);
          expect(toasts[0].message).toContain('Room 101');
          expect(toasts[0].message).toContain('John Doe');
          expect(toasts[0].title).toContain('Booking Confirmed');
        }
      });
    });
  });

  describe('showBookingError', () => {
    it('should show a formatted booking error message', () => {
      service.showBookingError('Room not available');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe(ToastType.ERROR);
          expect(toasts[0].message).toBe('Room not available');
          expect(toasts[0].title).toContain('Booking Failed');
          expect(toasts[0].duration).toBe(0);
        }
      });
    });

    it('should show default error message if none provided', () => {
      service.showBookingError('');

      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].message).toContain('An error occurred');
        }
      });
    });
  });

  describe('showLoading', () => {
    it('should show a loading toast and return ID', () => {
      const toastId = service.showLoading('Loading data...');

      expect(toastId).toBeTruthy();
      expect(toastId).toContain('toast_');

      const toasts = service.getCurrentToasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe(ToastType.INFO);
      expect(toasts[0].message).toBe('Loading data...');
      expect(toasts[0].duration).toBe(0);
    });

    it('should use default loading message if none provided', () => {
      service.showLoading();

      const toasts = service.getCurrentToasts();
      expect(toasts[0].message).toBe('Loading...');
    });

    it('should allow manual removal of loading toast', () => {
      const toastId = service.showLoading();
      
      expect(service.getCurrentToasts().length).toBe(1);
      
      service.remove(toastId);
      
      expect(service.getCurrentToasts().length).toBe(0);
    });
  });

  describe('getCurrentToasts', () => {
    it('should return current toasts synchronously', () => {
      service.showSuccess('Test 1', undefined, 0);
      service.showError('Test 2', undefined, 0);

      const toasts = service.getCurrentToasts();
      expect(toasts.length).toBe(2);
    });
  });

  describe('toast properties', () => {
    it('should generate unique IDs for each toast', () => {
      service.showInfo('Toast 1', undefined, 0);
      service.showInfo('Toast 2', undefined, 0);

      const toasts = service.getCurrentToasts();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('should set timestamp for each toast', () => {
      const beforeTime = Date.now();
      service.showInfo('Test', undefined, 0);
      const afterTime = Date.now();

      const toast = service.getCurrentToasts()[0];
      expect(toast.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(toast.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
