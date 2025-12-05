# Troubleshooting Guide: Data Sync Issues

## Problem: Deleted bookings in MockAPI still appear in the app

### Why This Happens

The app uses a dual-storage strategy:
1. **MockAPI** - Primary source of truth (cloud storage)
2. **localStorage** - Local browser cache for offline functionality

When you delete bookings directly from MockAPI dashboard, the app's localStorage still has the old data cached.

### Solution (FIXED)

The `mergeBookings()` method has been updated to:
- ✅ Use API data as the source of truth
- ✅ Only preserve local bookings with `local_` ID prefix (offline bookings)
- ✅ Remove bookings deleted from API from localStorage automatically

**Now when you delete bookings from MockAPI and refresh the page, they will be removed from the app!**

### How It Works Now

```typescript
// Before: Would re-add ALL local bookings
if (!existsInApi) {
  merged.push(localBooking); // ❌ Adds back deleted bookings
}

// After: Only adds local-only bookings
if (!existsInApi && isLocalOnly) {
  merged.push(localBooking); // ✅ Only adds offline bookings
}
```

### Testing the Fix

1. **Delete a booking from MockAPI dashboard**
2. **Refresh your app** (F5 or Ctrl+R)
3. **Result:** The deleted booking should disappear

### Manual localStorage Reset

If you still see old data, you can manually clear localStorage:

**Option 1: Browser Console**
```javascript
localStorage.clear();
location.reload();
```

**Option 2: Browser DevTools**
1. Press F12 to open DevTools
2. Go to "Application" tab
3. Click "Local Storage" → Your site URL
4. Right-click → "Clear"
5. Refresh the page

**Option 3: Programmatically (in your app)**
```typescript
// In BookingService
clearAllBookings(): void {
  this.bookingsSubject.next([]);
  if (this.isBrowser) {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

### Data Flow Diagram

```
User Action (Delete in MockAPI)
         ↓
    MockAPI Database
    (Booking Deleted)
         ↓
App Refresh / getBookings()
         ↓
Fetch from API (No deleted booking)
         ↓
Merge with localStorage
         ↓
Check: Is booking in localStorage?
         ↓
    Yes → Is ID prefixed with 'local_'?
         ↓
    Yes → Keep it (offline booking)
    No  → Remove it (was from API, now deleted)
         ↓
Update localStorage with merged data
         ↓
Display updated bookings list
```

### Booking ID Types

1. **API Bookings**: `"1"`, `"2"`, `"3"` (numbers as strings)
   - Created through the app and saved to API
   - Can be deleted from MockAPI dashboard
   - Will sync properly on app refresh

2. **Local Bookings**: `"local_1733395200000_abc123"`
   - Created when API is unavailable (offline mode)
   - Start with `local_` prefix
   - Preserved in localStorage until synced to API

### Best Practices

1. **Deleting Bookings**: Use the app's "Cancel" button instead of deleting from MockAPI
2. **Testing**: Use the MockAPI dashboard to test sync behavior
3. **Resetting Data**: Clear localStorage when switching between test datasets
4. **Offline Mode**: Local bookings will be preserved until online again

### Common Scenarios

| Scenario | What Happens | Expected Behavior |
|----------|--------------|-------------------|
| Delete booking in MockAPI | Removed from API | ✅ Disappears on refresh |
| Cancel booking in app | Updated in API & localStorage | ✅ Shows as cancelled |
| Create booking offline | Saved to localStorage only | ✅ Preserved until online |
| Create booking online | Saved to API & localStorage | ✅ Synced everywhere |
| Edit booking in MockAPI | API updated, localStorage stale | ✅ Syncs on refresh |

### Debugging localStorage

Check what's stored in localStorage:

```javascript
// In browser console
const bookings = JSON.parse(localStorage.getItem('hotel_bookings') || '[]');
console.table(bookings);
```

Check what's in MockAPI:

```powershell
# In PowerShell
Invoke-RestMethod -Uri "https://6932963ae5a9e342d26fd8e9.mockapi.io/bookings" | 
  Select-Object id, guestName, status | 
  Format-Table
```

### Future Improvements

Consider implementing:
- [ ] Delete booking method that calls API
- [ ] Periodic auto-sync with API
- [ ] Sync status indicator in UI
- [ ] Conflict resolution for offline edits
- [ ] Last sync timestamp display

---

**Related Files:**
- `src/app/services/booking.service.ts` - Booking logic and merge strategy
- `src/app/pages/booking-history/booking-history.component.ts` - Booking list UI
