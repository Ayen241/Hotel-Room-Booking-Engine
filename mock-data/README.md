# Mock Data for MockAPI

This folder contains mock data files and scripts to populate your MockAPI project.

## Files

- **`rooms.json`** - Sample room data (12 rooms with various types and availability)
- **`bookings.json`** - Sample booking data (5 bookings with different statuses)
- **`upload-mock-data.ps1`** - PowerShell script to automatically upload data to MockAPI

## Quick Start

### Option 1: Automatic Upload (Recommended)

Run the PowerShell script to automatically upload all data:

```powershell
# From the project root directory
.\upload-mock-data.ps1
```

This script will:
- ✅ Upload all rooms from `rooms.json`
- ✅ Upload all bookings from `bookings.json`
- ✅ Show progress with colored output
- ✅ Verify the upload was successful
- ✅ Display summary statistics

### Option 2: Manual Upload via MockAPI Dashboard

1. Go to [https://mockapi.io](https://mockapi.io) and log in
2. Open your project
3. Click on the **"rooms"** resource
4. Click **"+ Add Data"**
5. Copy the content from `rooms.json` (one room at a time)
6. Paste and save
7. Repeat for **"bookings"** resource using `bookings.json`

### Option 3: Manual Upload via API (PowerShell)

#### Upload Rooms
```powershell
$rooms = Get-Content mock-data/rooms.json | ConvertFrom-Json

foreach ($room in $rooms) {
    $body = $room | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "https://6932963ae5a9e342d26fd8e9.mockapi.io/rooms" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
    Start-Sleep -Milliseconds 200
}
```

#### Upload Bookings
```powershell
$bookings = Get-Content mock-data/bookings.json | ConvertFrom-Json

foreach ($booking in $bookings) {
    $body = $booking | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "https://6932963ae5a9e342d26fd8e9.mockapi.io/bookings" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
    Start-Sleep -Milliseconds 200
}
```

## Data Overview

### Rooms (12 total)
- **5 Types:** Single, Double, Deluxe, Suite
- **Price Range:** $80 - $300 per night
- **Available:** 10 rooms
- **Unavailable:** 2 rooms (202, 303)
- **Features:** All rooms include realistic descriptions, images, capacities, and amenities

### Bookings (5 total)
- **Confirmed:** 4 bookings
- **Cancelled:** 1 booking
- **Date Range:** November 2025 - December 2025

## Modifying the Data

### Adding More Rooms

Edit `rooms.json` and add new entries following this format:

```json
{
  "name": "105",
  "type": "Single",
  "price": 95,
  "isAvailable": true,
  "description": "Your description here",
  "imageUrl": "https://images.unsplash.com/photo-xxxxx?w=800",
  "capacity": 2,
  "amenities": ["WiFi", "TV", "Mini Bar"]
}
```

### Adding More Bookings

Edit `bookings.json` and add new entries:

```json
{
  "roomId": "1",
  "roomName": "101",
  "roomType": "Suite",
  "guestName": "Guest Name",
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-22",
  "totalPrice": 500,
  "numberOfNights": 2,
  "bookingDate": "2025-12-05T12:00:00.000Z",
  "status": "confirmed"
}
```

## Image URLs

All room images use Unsplash URLs. These are real images that will display properly. You can replace them with:
- Other Unsplash URLs: `https://images.unsplash.com/photo-{id}?w=800`
- Your own hosted images
- Placeholder services: `https://placehold.co/800x600`

## Clearing Data

To start fresh, you can delete all data from MockAPI:

### PowerShell Script to Delete All Data

```powershell
$API_BASE = "https://6932963ae5a9e342d26fd8e9.mockapi.io"

# Delete all rooms
$rooms = Invoke-RestMethod -Uri "$API_BASE/rooms" -Method Get
foreach ($room in $rooms) {
    Invoke-RestMethod -Uri "$API_BASE/rooms/$($room.id)" -Method Delete
    Write-Host "Deleted room: $($room.name)"
}

# Delete all bookings
$bookings = Invoke-RestMethod -Uri "$API_BASE/bookings" -Method Get
foreach ($booking in $bookings) {
    Invoke-RestMethod -Uri "$API_BASE/bookings/$($booking.id)" -Method Delete
    Write-Host "Deleted booking: $($booking.id)"
}
```

## Verifying Data

Check if data was uploaded successfully:

```powershell
# Check rooms
Invoke-RestMethod -Uri "https://6932963ae5a9e342d26fd8e9.mockapi.io/rooms" | 
    Select-Object id, name, type, price, isAvailable | 
    Format-Table

# Check bookings
Invoke-RestMethod -Uri "https://6932963ae5a9e342d26fd8e9.mockapi.io/bookings" | 
    Select-Object id, guestName, roomName, status | 
    Format-Table
```

## Troubleshooting

### Script Execution Policy Error

If you get an error about execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Rate Limiting

MockAPI has a rate limit of 100 requests per minute. The upload script includes delays to avoid this.

### CORS Errors

MockAPI has CORS enabled by default. If you experience issues:
1. Clear browser cache
2. Check DevTools Console for specific errors
3. Verify the API base URL in `api.constants.ts`

## Field Mapping

| JSON Field     | Type    | Required | Description                    |
|----------------|---------|----------|--------------------------------|
| name           | string  | ✅       | Room number/identifier         |
| type           | string  | ✅       | Room type category             |
| price          | number  | ✅       | Price per night                |
| isAvailable    | boolean | ✅       | Availability status            |
| description    | string  | ❌       | Room description               |
| imageUrl       | string  | ❌       | Image URL                      |
| capacity       | number  | ❌       | Maximum guests                 |
| amenities      | array   | ❌       | List of amenities              |

## Notes

- **IDs:** MockAPI auto-generates IDs, so they're not included in the JSON files
- **Timestamps:** Use ISO 8601 format for dates: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **Status:** Booking status should be either `"confirmed"` or `"cancelled"`
- **Consistency:** Ensure booking `roomId` matches actual room IDs in MockAPI

---

**Need help?** Check the main `MOCKAPI_SETUP_GUIDE.md` in the project root.
