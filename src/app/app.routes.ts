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
    title: 'Available Rooms - Hotel Booking'
  },
  {
    path: 'bookings',
    component: BookingHistoryComponent,
    title: 'My Bookings - Hotel Booking'
  },
  {
    path: '**',
    redirectTo: '/rooms'
  }
];

