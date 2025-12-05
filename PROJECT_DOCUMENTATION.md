# 🏨 Hotel Room Booking Engine - Complete Project Documentation

**Project Name:** Hotel Room Booking Engine  
**Framework:** Angular 21.0.0  
**Language:** TypeScript 5.9.2 (Strict Mode)  
**UI Framework:** Bootstrap 5.3+  
**API:** MockAPI.io  
**Date Created:** December 5, 2025  
**Repository:** Hotel-Room-Booking-Engine (Ayen241)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Requirements](#technical-requirements)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [Data Models](#data-models)
5. [API Endpoints & Mock Data](#api-endpoints--mock-data)
6. [Services Documentation](#services-documentation)
7. [Components Documentation](#components-documentation)
8. [Pages Documentation](#pages-documentation)
9. [Routing Configuration](#routing-configuration)
10. [Styling Guidelines](#styling-guidelines)
11. [Implementation Phases](#implementation-phases)
12. [Code Examples](#code-examples)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Guide](#deployment-guide)
15. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### Goal
Build a fully functional Hotel Room Booking Engine that allows users to:
- View available hotel rooms
- Filter rooms by type
- Book rooms with guest details and dates
- Receive booking confirmations
- Persist bookings in localStorage

### Key Features
✅ **Room List Page** - Display all hotel rooms with details  
✅ **Room Card Component** - Reusable card for each room  
✅ **Booking Modal** - Reactive form for booking details  
✅ **Toast Notifications** - Success/error feedback  
✅ **Search & Filter** - Filter rooms by type  
✅ **LocalStorage** - Persist bookings locally  
✅ **Responsive Design** - Desktop & mobile support  
✅ **Type Safety** - Strict TypeScript, no `any`

### MockAPI Endpoint
**Base URL:** `https://6932963ae5a9e342d26fd8e9.mockapi.io/`

**Available Endpoints:**
- `GET /rooms` - Fetch all rooms
- `GET /rooms/:id` - Fetch single room
- `PUT /rooms/:id` - Update room (availability)
- `POST /bookings` - Create new booking
- `GET /bookings` - Fetch all bookings

---

## 2. Technical Requirements

### Dependencies

#### Current Dependencies (from package.json)
```json
{
  "@angular/common": "^21.0.0",
  "@angular/compiler": "^21.0.0",
  "@angular/core": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@angular/platform-browser": "^21.0.0",
  "@angular/platform-server": "^21.0.0",
  "@angular/router": "^21.0.0",
  "@angular/ssr": "^21.0.2",
  "express": "^5.1.0",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0"
}
```

#### To Install
```bash
npm install bootstrap bootstrap-icons
npm install @ng-bootstrap/ng-bootstrap --legacy-peer-deps
```

### TypeScript Configuration
**Mode:** Strict  
**Version:** 5.9.2  
**Rules:**
- No `any` types allowed
- Strict null checks enabled
- Strict function types enabled

### Angular Configuration
**Version:** 21.0.0  
**Prefix:** `app`  
**Style:** CSS  
**Routing:** Enabled  
**SSR:** Enabled (can be disabled for this project)

---

## 3. Architecture & Folder Structure

### Recommended Folder Structure

```
src/
├── app/
│   ├── models/                    # TypeScript interfaces & enums
│   │   ├── room.model.ts
│   │   ├── booking.model.ts
│   │   ├── room-type.enum.ts
│   │   └── index.ts               # Barrel export
│   │
│   ├── services/                  # Business logic & API services
│   │   ├── room.service.ts
│   │   ├── booking.service.ts
│   │   ├── toast.service.ts
│   │   └── index.ts               # Barrel export
│   │
│   ├── components/                # Reusable components
│   │   ├── room-card/
│   │   │   ├── room-card.component.ts
│   │   │   ├── room-card.component.html
│   │   │   └── room-card.component.css
│   │   │
│   │   ├── book-room-modal/
│   │   │   ├── book-room-modal.component.ts
│   │   │   ├── book-room-modal.component.html
│   │   │   └── book-room-modal.component.css
│   │   │
│   │   ├── toast/
│   │   │   ├── toast.component.ts
│   │   │   ├── toast.component.html
│   │   │   └── toast.component.css
│   │   │
│   │   └── loading-spinner/
│   │       ├── loading-spinner.component.ts
│   │       ├── loading-spinner.component.html
│   │       └── loading-spinner.component.css
│   │
│   ├── pages/                     # Page-level components
│   │   ├── room-list/
│   │   │   ├── room-list.component.ts
│   │   │   ├── room-list.component.html
│   │   │   └── room-list.component.css
│   │   │
│   │   └── booking-history/       # Optional bonus feature
│   │       ├── booking-history.component.ts
│   │       ├── booking-history.component.html
│   │       └── booking-history.component.css
│   │
│   ├── shared/                    # Shared utilities
│   │   ├── utils/
│   │   │   └── date-validator.ts
│   │   └── constants/
│   │       └── api.constants.ts
│   │
│   ├── app.ts                     # Root component
│   ├── app.html
│   ├── app.css
│   ├── app.config.ts              # App configuration
│   ├── app.routes.ts              # Routing configuration
│   └── app.spec.ts
│
├── styles.css                     # Global styles
├── index.html
├── main.ts
└── ...
```

### Module Architecture (Angular 21 Standalone Components)

Angular 21 uses **standalone components** by default, so we don't need NgModules. Instead:

```typescript
// Component imports its own dependencies
@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RoomCardComponent],
  templateUrl: './room-list.component.html'
})
export class RoomListComponent { }
```

---

## 4. Data Models

### Room Model (`models/room.model.ts`)

```typescript
import { RoomType } from './room-type.enum';

export interface Room {
  id: string;                    // Unique identifier from MockAPI
  name: string;                  // Room number (e.g., "101", "102", "201")
  type: RoomType;                // Room type enum
  price: number;                 // Price per night
  isAvailable: boolean;          // Availability status
  description?: string;          // Optional description
  imageUrl?: string;             // Optional image
  amenities?: string[];          // Optional amenities list
  capacity?: number;             // Optional max guests
}
```

### Booking Model (`models/booking.model.ts`)

```typescript
export interface Booking {
  id: string;                    // Unique identifier
  roomId: string;                // Reference to Room.id
  roomName: string;              // Room name for display
  roomType: string;              // Room type for display
  guestName: string;             // Guest's full name
  checkInDate: string;           // ISO date string (YYYY-MM-DD)
  checkOutDate: string;          // ISO date string (YYYY-MM-DD)
  totalPrice: number;            // Calculated total
  numberOfNights: number;        // Calculated nights
  bookingDate: string;           // When booking was made
  status: BookingStatus;         // Booking status
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}
```

### Room Type Enum (`models/room-type.enum.ts`)

```typescript
export enum RoomType {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  SUITE = 'Suite',
  DELUXE = 'Deluxe',
  FAMILY = 'Family'
}

// Helper function to get all room types as array
export function getAllRoomTypes(): string[] {
  return Object.values(RoomType);
}
```

### Barrel Export (`models/index.ts`)

```typescript
export * from './room.model';
export * from './booking.model';
export * from './room-type.enum';
```

---

## 5. API Endpoints & Mock Data

### MockAPI Configuration

**Base URL:** `https://6932963ae5a9e342d26fd8e9.mockapi.io/`

### Endpoints

#### 1. Rooms Endpoint

**GET** `/rooms`
- Returns array of all rooms
- Used for displaying room list

**GET** `/rooms/:id`
- Returns single room by ID
- Used for room details

**PUT** `/rooms/:id`
- Updates room data (mainly `isAvailable`)
- Used after booking to mark room as booked

**Request Body Example:**
```json
{
  "isAvailable": false
}
```

#### 2. Bookings Endpoint

**POST** `/bookings`
- Creates new booking
- Returns created booking with ID

**Request Body Example:**
```json
{
  "roomId": "1",
  "roomName": "101",
  "roomType": "Single",
  "guestName": "John Doe",
  "checkInDate": "2025-12-10",
  "checkOutDate": "2025-12-15",
  "totalPrice": 500,
  "numberOfNights": 5,
  "bookingDate": "2025-12-05T10:30:00.000Z",
  "status": "confirmed"
}
```

**GET** `/bookings`
- Returns array of all bookings
- Used for booking history

### Mock Data Schema

#### Rooms Collection (Initial Data)

```json
[
  {
    "id": "1",
    "name": "101",
    "type": "Single",
    "price": 100,
    "isAvailable": true,
    "description": "Cozy single room with city view",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+101",
    "amenities": ["WiFi", "TV", "AC"],
    "capacity": 1
  },
  {
    "id": "2",
    "name": "102",
    "type": "Single",
    "price": 100,
    "isAvailable": true,
    "description": "Comfortable single room",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+102",
    "amenities": ["WiFi", "TV", "AC"],
    "capacity": 1
  },
  {
    "id": "3",
    "name": "201",
    "type": "Double",
    "price": 150,
    "isAvailable": true,
    "description": "Spacious double room with queen bed",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+201",
    "amenities": ["WiFi", "TV", "AC", "Mini Bar"],
    "capacity": 2
  },
  {
    "id": "4",
    "name": "202",
    "type": "Double",
    "price": 150,
    "isAvailable": false,
    "description": "Elegant double room",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+202",
    "amenities": ["WiFi", "TV", "AC", "Mini Bar"],
    "capacity": 2
  },
  {
    "id": "5",
    "name": "301",
    "type": "Suite",
    "price": 300,
    "isAvailable": true,
    "description": "Luxury suite with living area",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+301",
    "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi", "Kitchen"],
    "capacity": 4
  },
  {
    "id": "6",
    "name": "302",
    "type": "Suite",
    "price": 300,
    "isAvailable": true,
    "description": "Premium suite with ocean view",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+302",
    "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi", "Kitchen"],
    "capacity": 4
  },
  {
    "id": "7",
    "name": "401",
    "type": "Deluxe",
    "price": 250,
    "isAvailable": true,
    "description": "Deluxe room with panoramic view",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+401",
    "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
    "capacity": 2
  },
  {
    "id": "8",
    "name": "501",
    "type": "Family",
    "price": 200,
    "isAvailable": true,
    "description": "Family room with two bedrooms",
    "imageUrl": "https://via.placeholder.com/300x200?text=Room+501",
    "amenities": ["WiFi", "TV", "AC", "Kitchen"],
    "capacity": 6
  }
]
```

---

## 6. Services Documentation

### 6.1 RoomService (`services/room.service.ts`)

**Purpose:** Manage room data and API interactions

**Key Features:**
- Fetch rooms from API
- Update room availability
- Cache rooms in BehaviorSubject for reactive updates
- Error handling

**Public Methods:**

```typescript
export class RoomService {
  // Fetch all rooms from API
  getRooms(): Observable<Room[]>
  
  // Get single room by ID
  getRoomById(id: string): Observable<Room>
  
  // Update room availability after booking
  updateRoomAvailability(roomId: string, isAvailable: boolean): Observable<Room>
  
  // Get rooms as Observable (reactive)
  rooms$: Observable<Room[]>
  
  // Refresh rooms data
  refreshRooms(): void
}
```

**Implementation Notes:**
- Uses `HttpClient` for API calls
- Uses `BehaviorSubject` for state management
- Implements error handling with `catchError`
- Provides loading state

---

### 6.2 BookingService (`services/booking.service.ts`)

**Purpose:** Manage bookings and localStorage persistence

**Key Features:**
- Create new bookings
- Store bookings in localStorage
- Fetch booking history
- Calculate booking details (nights, total price)
- Trigger toast notifications

**Public Methods:**

```typescript
export class BookingService {
  // Create new booking
  createBooking(booking: Omit<Booking, 'id'>): Observable<Booking>
  
  // Get all bookings
  getBookings(): Observable<Booking[]>
  
  // Get bookings from localStorage
  getLocalBookings(): Booking[]
  
  // Save booking to localStorage
  saveBookingLocally(booking: Booking): void
  
  // Calculate number of nights
  calculateNights(checkIn: string, checkOut: string): number
  
  // Calculate total price
  calculateTotalPrice(pricePerNight: number, nights: number): number
  
  // Get bookings for specific room
  getBookingsByRoom(roomId: string): Booking[]
}
```

**LocalStorage Key:** `hotel_bookings`

**Implementation Notes:**
- Syncs with MockAPI and localStorage
- Validates dates before booking
- Triggers toast service for feedback
- Handles concurrent bookings

---

### 6.3 ToastService (`services/toast.service.ts`)

**Purpose:** Display toast notifications to users

**Key Features:**
- Success messages
- Error messages
- Warning messages
- Auto-dismiss after 3 seconds
- Queue multiple toasts

**Public Methods:**

```typescript
export class ToastService {
  // Show success toast
  showSuccess(message: string): void
  
  // Show error toast
  showError(message: string): void
  
  // Show warning toast
  showWarning(message: string): void
  
  // Show info toast
  showInfo(message: string): void
  
  // Get toasts as Observable
  toasts$: Observable<Toast[]>
  
  // Remove specific toast
  remove(toast: Toast): void
  
  // Clear all toasts
  clear(): void
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}
```

---

## 7. Components Documentation

### 7.1 RoomCardComponent (`components/room-card/`)

**Purpose:** Reusable card to display individual room information

**Inputs:**
```typescript
@Input({ required: true }) room!: Room;
```

**Outputs:**
```typescript
@Output() bookRoom = new EventEmitter<Room>();
```

**Features:**
- Displays room name, type, price
- Shows availability badge (Available/Booked)
- Book button (disabled when booked)
- Responsive card design
- Hover effects

**Bootstrap Classes Used:**
- `card`, `card-body`, `card-title`, `card-text`
- `badge`, `bg-success`, `bg-danger`
- `btn`, `btn-primary`, `btn-disabled`

**Template Structure:**
```html
<div class="card h-100">
  <img [src]="room.imageUrl" class="card-img-top" alt="Room image">
  <div class="card-body">
    <h5 class="card-title">Room {{ room.name }}</h5>
    <p class="card-text">
      <span class="badge">{{ room.type }}</span>
    </p>
    <p class="card-text">${{ room.price }} / night</p>
    <span class="badge" [class.bg-success]="room.isAvailable" 
          [class.bg-danger]="!room.isAvailable">
      {{ room.isAvailable ? 'Available' : 'Booked' }}
    </span>
    <button class="btn btn-primary" 
            [disabled]="!room.isAvailable"
            (click)="onBookClick()">
      Book Now
    </button>
  </div>
</div>
```

---

### 7.2 BookRoomModalComponent (`components/book-room-modal/`)

**Purpose:** Modal dialog with booking form

**Inputs:**
```typescript
@Input({ required: true }) room!: Room;
@Input() isVisible: boolean = false;
```

**Outputs:**
```typescript
@Output() bookingSubmit = new EventEmitter<BookingFormData>();
@Output() modalClose = new EventEmitter<void>();
```

**Features:**
- Reactive form with validators
- Guest name field (required, min 3 chars)
- Check-in date (required, today or future)
- Check-out date (required, after check-in)
- Real-time validation
- Error messages
- Price calculation preview
- Bootstrap modal

**Form Structure:**
```typescript
bookingForm = this.fb.group({
  guestName: ['', [Validators.required, Validators.minLength(3)]],
  checkInDate: ['', [Validators.required, this.dateValidator.notPast]],
  checkOutDate: ['', [Validators.required, this.dateValidator.notPast]]
}, {
  validators: this.dateValidator.checkOutAfterCheckIn
});
```

**Custom Validators:**
- `notPast` - Ensures date is not in the past
- `checkOutAfterCheckIn` - Ensures check-out is after check-in

---

### 7.3 ToastComponent (`components/toast/`)

**Purpose:** Display toast notifications

**Features:**
- Multiple toast types (success, error, warning, info)
- Auto-dismiss after 3 seconds
- Manual close button
- Stacking multiple toasts
- Animation (fade in/out)
- Fixed position (top-right)

**Template Structure:**
```html
<div class="toast-container position-fixed top-0 end-0 p-3">
  @for (toast of toasts$ | async; track toast.id) {
    <div class="toast show" 
         [class.bg-success]="toast.type === 'success'"
         [class.bg-danger]="toast.type === 'error'">
      <div class="toast-body text-white">
        {{ toast.message }}
        <button type="button" class="btn-close" 
                (click)="close(toast)"></button>
      </div>
    </div>
  }
</div>
```

---

### 7.4 LoadingSpinnerComponent (`components/loading-spinner/`)

**Purpose:** Display loading indicator during API calls

**Inputs:**
```typescript
@Input() isLoading: boolean = false;
@Input() message: string = 'Loading...';
```

**Features:**
- Bootstrap spinner
- Optional loading message
- Centered overlay
- Backdrop blur effect

---

## 8. Pages Documentation

### 8.1 RoomListComponent (`pages/room-list/`)

**Purpose:** Main page displaying all rooms

**Features:**
- Fetches rooms on init
- Displays rooms in responsive grid
- Room type filter dropdown
- Search functionality
- Loading state
- Error handling
- Opens booking modal
- Handles booking submission

**Component Structure:**
```typescript
export class RoomListComponent implements OnInit {
  rooms$!: Observable<Room[]>;
  filteredRooms$!: Observable<Room[]>;
  isLoading = signal(false);
  selectedRoomType = signal<string>('all');
  selectedRoom = signal<Room | null>(null);
  showModal = signal(false);
  
  constructor(
    private roomService: RoomService,
    private bookingService: BookingService
  ) {}
  
  ngOnInit(): void {
    this.loadRooms();
  }
  
  loadRooms(): void { }
  filterRooms(type: string): void { }
  openBookingModal(room: Room): void { }
  handleBooking(bookingData: BookingFormData): void { }
}
```

**Template Features:**
- Bootstrap container and grid
- Filter dropdown
- Room cards in responsive columns
- Modal integration

**Grid Layout:**
```html
<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
  @for (room of filteredRooms$ | async; track room.id) {
    <div class="col">
      <app-room-card 
        [room]="room"
        (bookRoom)="openBookingModal($event)">
      </app-room-card>
    </div>
  }
</div>
```

---

### 8.2 BookingHistoryComponent (Optional Bonus)

**Purpose:** Display user's booking history

**Features:**
- List all bookings from localStorage
- Show booking details
- Filter by status
- Sort by date
- Cancel booking option

---

## 9. Routing Configuration

### Routes (`app.routes.ts`)

```typescript
import { Routes } from '@angular/router';
import { RoomListComponent } from './pages/room-list/room-list.component';
import { BookingHistoryComponent } from './pages/booking-history/booking-history.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/rooms',
    pathMatch: 'full'
  },
  {
    path: 'rooms',
    component: RoomListComponent,
    title: 'Available Rooms'
  },
  {
    path: 'bookings',
    component: BookingHistoryComponent,
    title: 'My Bookings'
  },
  {
    path: '**',
    redirectTo: '/rooms'
  }
];
```

### Navigation (Optional)

If adding a navbar:

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" routerLink="/">Hotel Booking</a>
    <div class="navbar-nav">
      <a class="nav-link" routerLink="/rooms" routerLinkActive="active">Rooms</a>
      <a class="nav-link" routerLink="/bookings" routerLinkActive="active">My Bookings</a>
    </div>
  </div>
</nav>
```

---

## 10. Styling Guidelines

### Global Styles (`styles.css`)

```css
/* Import Bootstrap */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

/* Global styles */
:root {
  --primary-color: #0d6efd;
  --success-color: #198754;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
}

/* Custom utility classes */
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}
```

### Bootstrap Configuration (`angular.json`)

```json
{
  "styles": [
    "node_modules/bootstrap/dist/css/bootstrap.min.css",
    "node_modules/bootstrap-icons/font/bootstrap-icons.css",
    "src/styles.css"
  ],
  "scripts": [
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
  ]
}
```

### Component-Specific Styles

**RoomCardComponent:**
```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}
```

---

## 11. Implementation Phases

### Phase 1: Setup (30 minutes)
- ✅ Install Bootstrap and dependencies
- ✅ Create folder structure
- ✅ Configure angular.json
- ✅ Set up global styles

### Phase 2: Models & API (20 minutes)
- ✅ Create TypeScript interfaces
- ✅ Set up MockAPI data
- ✅ Create API constants

### Phase 3: Services (45 minutes)
- ✅ RoomService implementation
- ✅ BookingService implementation
- ✅ ToastService implementation

### Phase 4: Components (1.5 hours)
- ✅ RoomCardComponent
- ✅ BookRoomModalComponent
- ✅ ToastComponent
- ✅ LoadingSpinnerComponent

### Phase 5: Pages (1 hour)
- ✅ RoomListComponent
- ✅ BookingHistoryComponent (bonus)

### Phase 6: Integration & Testing (45 minutes)
- ✅ Connect all components
- ✅ Test booking flow
- ✅ Test responsiveness
- ✅ Fix bugs

### Phase 7: Documentation (30 minutes)
- ✅ Code comments
- ✅ README.md
- ✅ PDF summary

**Total Estimated Time:** 5-6 hours

---

## 12. Code Examples

### Example: RoomService Implementation

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { Room } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://6932963ae5a9e342d26fd8e9.mockapi.io/rooms';
  
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  public rooms$ = this.roomsSubject.asObservable();
  
  /**
   * Fetch all rooms from API
   */
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl).pipe(
      tap(rooms => this.roomsSubject.next(rooms)),
      catchError(this.handleError)
    );
  }
  
  /**
   * Update room availability after booking
   */
  updateRoomAvailability(roomId: string, isAvailable: boolean): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${roomId}`, { isAvailable }).pipe(
      tap(updatedRoom => {
        const currentRooms = this.roomsSubject.value;
        const index = currentRooms.findIndex(r => r.id === roomId);
        if (index !== -1) {
          currentRooms[index] = updatedRoom;
          this.roomsSubject.next([...currentRooms]);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

### Example: Booking Form with Validation

```typescript
import { Component, inject, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Room } from '../../models';

@Component({
  selector: 'app-book-room-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-room-modal.component.html'
})
export class BookRoomModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  
  @Input({ required: true }) room!: Room;
  @Input() isVisible = false;
  @Output() bookingSubmit = new EventEmitter<BookingFormData>();
  @Output() modalClose = new EventEmitter<void>();
  
  minDate = signal('');
  
  bookingForm = this.fb.group({
    guestName: ['', [Validators.required, Validators.minLength(3)]],
    checkInDate: ['', Validators.required],
    checkOutDate: ['', Validators.required]
  }, {
    validators: this.dateRangeValidator
  });
  
  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.minDate.set(today);
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
  
  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.bookingSubmit.emit(this.bookingForm.value);
      this.bookingForm.reset();
    }
  }
  
  close(): void {
    this.modalClose.emit();
    this.bookingForm.reset();
  }
}
```

---

## 13. Testing Strategy

### Unit Testing

**Test Files to Create:**
- `room.service.spec.ts`
- `booking.service.spec.ts`
- `room-card.component.spec.ts`
- `book-room-modal.component.spec.ts`
- `room-list.component.spec.ts`

**Key Test Scenarios:**

**Services:**
- ✅ Fetch rooms successfully
- ✅ Handle API errors
- ✅ Update room availability
- ✅ Create booking
- ✅ LocalStorage persistence
- ✅ Date calculations

**Components:**
- ✅ Display room data correctly
- ✅ Emit events properly
- ✅ Form validation works
- ✅ Modal opens/closes
- ✅ Booking submission

**Example Test:**
```typescript
describe('RoomService', () => {
  let service: RoomService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoomService]
    });
    
    service = TestBed.inject(RoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch rooms', () => {
    const mockRooms: Room[] = [...];
    
    service.getRooms().subscribe(rooms => {
      expect(rooms.length).toBe(8);
      expect(rooms).toEqual(mockRooms);
    });
    
    const req = httpMock.expectOne('https://6932963ae5a9e342d26fd8e9.mockapi.io/rooms');
    expect(req.request.method).toBe('GET');
    req.flush(mockRooms);
  });
});
```

---

## 14. Deployment Guide

### Build for Production

```bash
# Build the application
npm run build

# Output will be in dist/hotel-booking/browser/
```

### Deploy to GitHub Pages

```bash
# Install Angular GitHub Pages deployer
npm install -g angular-cli-ghpages

# Build with base href
ng build --base-href "https://Ayen241.github.io/Hotel-Room-Booking-Engine/"

# Deploy
ngh --dir=dist/hotel-booking/browser
```

### Environment Configuration

For different environments, create:

`src/environments/environment.ts` (development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://6932963ae5a9e342d26fd8e9.mockapi.io'
};
```

`src/environments/environment.prod.ts` (production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://6932963ae5a9e342d26fd8e9.mockapi.io'
};
```

### Alternative Deployment Options

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist/hotel-booking/browser
```

---

## 15. Future Enhancements

### Potential Features to Add

1. **User Authentication**
   - Login/Register
   - User profiles
   - Protected routes

2. **Advanced Filtering**
   - Price range slider
   - Capacity filter
   - Amenities filter
   - Sort by price/name

3. **Room Details Page**
   - Dedicated page for each room
   - Image gallery
   - Reviews
   - Availability calendar

4. **Payment Integration**
   - Stripe/PayPal integration
   - Payment confirmation
   - Invoice generation

5. **Admin Panel**
   - Manage rooms
   - View all bookings
   - Analytics dashboard

6. **Email Notifications**
   - Booking confirmation email
   - Reminder emails
   - Cancellation emails

7. **Multi-language Support**
   - i18n implementation
   - Multiple currencies

8. **Accessibility (A11y)**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

9. **PWA Features**
   - Offline support
   - Push notifications
   - Install as app

10. **Real-time Updates**
    - WebSocket integration
    - Live availability updates
    - Concurrent booking prevention

---

## 16. Troubleshooting Guide

### Common Issues & Solutions

**Issue 1: Bootstrap styles not loading**
```bash
# Solution: Ensure Bootstrap is in angular.json
# Check node_modules/bootstrap exists
npm install bootstrap
```

**Issue 2: CORS errors with MockAPI**
```typescript
// MockAPI should handle CORS automatically
// If issues persist, add proxy configuration
// Create proxy.conf.json in root
{
  "/api": {
    "target": "https://6932963ae5a9e342d26fd8e9.mockapi.io",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

**Issue 3: Date picker not working**
```html
<!-- Use native HTML5 date input -->
<input type="date" formControlName="checkInDate" [min]="minDate()">
```

**Issue 4: Modal not closing**
```typescript
// Ensure Bootstrap JS is loaded in angular.json
// Or use Angular Modal library
npm install @ng-bootstrap/ng-bootstrap
```

---

## 17. Code Quality Standards

### TypeScript Standards

✅ **Use strict mode** - No `any` types  
✅ **Use interfaces** - Define clear contracts  
✅ **Use enums** - For fixed value sets  
✅ **Use readonly** - For immutable properties  
✅ **Use signals** - For reactive state (Angular 21)  
✅ **Use inject()** - For dependency injection  

### Angular Best Practices

✅ **Standalone components** - Default in Angular 21  
✅ **OnPush change detection** - For performance  
✅ **Reactive forms** - For complex forms  
✅ **RxJS operators** - For data transformation  
✅ **Lazy loading** - For large apps  
✅ **Smart/Dumb components** - Separation of concerns  

### CSS Standards

✅ **Use Bootstrap utilities** - Minimize custom CSS  
✅ **Mobile-first** - Start with mobile layout  
✅ **Consistent spacing** - Use Bootstrap spacing utilities  
✅ **Accessibility** - ARIA labels, contrast ratios  

---

## 18. API Integration Details

### HTTP Interceptors (Optional Enhancement)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  loadingService.show();
  
  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
```

### Error Handling Strategy

```typescript
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private toastService: ToastService) {}
  
  handleError(error: Error): void {
    console.error('Global error:', error);
    this.toastService.showError('An unexpected error occurred');
  }
}
```

---

## 19. Performance Optimization

### Strategies

1. **OnPush Change Detection**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

2. **TrackBy Function**
```html
@for (room of rooms; track room.id) { }
```

3. **Lazy Loading**
```typescript
{
  path: 'bookings',
  loadComponent: () => import('./pages/booking-history/booking-history.component')
}
```

4. **Image Optimization**
```html
<img [src]="room.imageUrl" loading="lazy" alt="Room">
```

---

## 20. Security Considerations

### Best Practices

✅ **Input Validation** - Validate all user inputs  
✅ **XSS Prevention** - Angular sanitizes by default  
✅ **CSRF Protection** - Use Angular HttpClient  
✅ **Environment Variables** - Store API keys securely  
✅ **HTTPS** - Always use HTTPS in production  

---

## 21. Accessibility (A11y) Checklist

✅ **Semantic HTML** - Use proper HTML tags  
✅ **ARIA Labels** - Add aria-label for icons  
✅ **Keyboard Navigation** - Tab through forms  
✅ **Focus Management** - Proper focus handling  
✅ **Color Contrast** - WCAG 2.1 AA compliance  
✅ **Screen Reader Support** - Test with screen readers  

---

## 22. Git Workflow

### Branch Strategy

```bash
main          # Production-ready code
develop       # Integration branch
feature/*     # Feature branches
bugfix/*      # Bug fix branches
```

### Commit Convention

```
feat: Add room booking modal
fix: Correct date validation bug
docs: Update README with deployment guide
style: Format code with Prettier
refactor: Improve booking service logic
test: Add unit tests for room service
```

---

## 23. Dependencies Summary

### Required Dependencies

```json
{
  "dependencies": {
    "bootstrap": "^5.3.2",
    "bootstrap-icons": "^1.11.0",
    "@ng-bootstrap/ng-bootstrap": "^15.0.0"
  }
}
```

### Installation Commands

```bash
# Install Bootstrap
npm install bootstrap bootstrap-icons

# Install Angular Bootstrap (optional, for better modal support)
npm install @ng-bootstrap/ng-bootstrap --legacy-peer-deps
```

---

## 24. Quick Reference

### Component Communication

**Parent to Child:** `@Input()`  
**Child to Parent:** `@Output()` + `EventEmitter`  
**Service:** Shared state with `BehaviorSubject`

### RxJS Operators

**`tap`** - Side effects  
**`map`** - Transform data  
**`filter`** - Filter data  
**`catchError`** - Handle errors  
**`switchMap`** - Switch to new observable  
**`combineLatest`** - Combine multiple observables  

### Bootstrap Classes

**Grid:** `container`, `row`, `col-*`  
**Spacing:** `m-*`, `p-*`, `mt-*`, `mb-*`  
**Colors:** `text-*`, `bg-*`, `border-*`  
**Components:** `btn`, `card`, `badge`, `modal`, `toast`

---

## 25. Final Checklist

Before considering the project complete:

- [ ] All components created and tested
- [ ] Services implemented with error handling
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Form validation working correctly
- [ ] Toast notifications appearing
- [ ] LocalStorage persistence working
- [ ] API integration successful
- [ ] No console errors
- [ ] TypeScript strict mode compliance (no `any`)
- [ ] Code formatted and linted
- [ ] Comments added to complex logic
- [ ] README.md complete
- [ ] Deployment successful
- [ ] All requirements met

---

## 📞 Support & Resources

### Documentation Links

- [Angular Documentation](https://angular.dev)
- [Bootstrap Documentation](https://getbootstrap.com)
- [RxJS Documentation](https://rxjs.dev)
- [MockAPI Documentation](https://mockapi.io/docs)

### Useful Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
ng lint

# Format code
npx prettier --write .
```

---

## 📄 Project Summary

**What We're Building:**
A modern, responsive Hotel Room Booking Engine with Angular 21, TypeScript, and Bootstrap.

**Key Technologies:**
- Angular 21 (standalone components)
- TypeScript 5.9 (strict mode)
- Bootstrap 5.3+
- RxJS 7.8
- MockAPI.io

**Main Features:**
- View available rooms
- Filter by room type
- Book rooms with date selection
- Toast notifications
- LocalStorage persistence
- Fully responsive design

**Project Status:** Ready for implementation phase-by-phase

---

**Document Version:** 1.0  
**Last Updated:** December 5, 2025  
**Author:** AI Assistant for Ayen241  
**Repository:** [Hotel-Room-Booking-Engine](https://github.com/Ayen241/Hotel-Room-Booking-Engine)

---

*This documentation serves as a complete blueprint for implementing the Hotel Room Booking Engine. Use it as a reference throughout development and share it for context in future conversations.*
