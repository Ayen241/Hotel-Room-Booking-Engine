# MockAPI Data Upload Script
# This script uploads the mock data to your MockAPI project

# Configuration
$API_BASE_URL = "https://6932963ae5a9e342d26fd8e9.mockapi.io"
$ROOMS_FILE = "mock-data/rooms.json"
$BOOKINGS_FILE = "mock-data/bookings.json"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MockAPI Data Upload Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to upload data
function Upload-Data {
    param (
        [string]$Endpoint,
        [string]$FilePath,
        [string]$ResourceName
    )
    
    Write-Host "Uploading $ResourceName..." -ForegroundColor Yellow
    
    # Check if file exists
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ❌ Error: File not found - $FilePath" -ForegroundColor Red
        return
    }
    
    # Read JSON file
    $jsonContent = Get-Content $FilePath -Raw
    $items = $jsonContent | ConvertFrom-Json
    
    $successCount = 0
    $errorCount = 0
    
    # Upload each item
    foreach ($item in $items) {
        try {
            $body = $item | ConvertTo-Json -Compress
            
            $response = Invoke-RestMethod -Uri $Endpoint `
                -Method Post `
                -Body $body `
                -ContentType "application/json" `
                -ErrorAction Stop
            
            $successCount++
            $itemName = if ($item.name) { $item.name } else { $item.guestName }
            Write-Host "  ✅ Uploaded: $itemName" -ForegroundColor Green
        }
        catch {
            $errorCount++
            $itemName = if ($item.name) { $item.name } else { $item.guestName }
            Write-Host "  ❌ Failed: $itemName - $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Small delay to avoid rate limiting
        Start-Sleep -Milliseconds 200
    }
    
    Write-Host ""
    Write-Host "  Summary: $successCount succeeded, $errorCount failed" -ForegroundColor Cyan
    Write-Host ""
}

# Upload Rooms
Write-Host "Step 1: Uploading Rooms" -ForegroundColor Magenta
Write-Host "------------------------" -ForegroundColor Magenta
Upload-Data -Endpoint "$API_BASE_URL/rooms" -FilePath $ROOMS_FILE -ResourceName "Rooms"

# Upload Bookings
Write-Host "Step 2: Uploading Bookings" -ForegroundColor Magenta
Write-Host "------------------------" -ForegroundColor Magenta
Upload-Data -Endpoint "$API_BASE_URL/bookings" -FilePath $BOOKINGS_FILE -ResourceName "Bookings"

# Verify the uploads
Write-Host "Step 3: Verifying Data" -ForegroundColor Magenta
Write-Host "------------------------" -ForegroundColor Magenta

try {
    Write-Host "Fetching rooms..." -ForegroundColor Yellow
    $rooms = Invoke-RestMethod -Uri "$API_BASE_URL/rooms" -Method Get
    Write-Host "  ✅ Total rooms in API: $($rooms.Count)" -ForegroundColor Green
    Write-Host "  ✅ Available rooms: $(($rooms | Where-Object { $_.isAvailable -eq $true }).Count)" -ForegroundColor Green
    Write-Host "  ✅ Unavailable rooms: $(($rooms | Where-Object { $_.isAvailable -eq $false }).Count)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Fetching bookings..." -ForegroundColor Yellow
    $bookings = Invoke-RestMethod -Uri "$API_BASE_URL/bookings" -Method Get
    Write-Host "  ✅ Total bookings in API: $($bookings.Count)" -ForegroundColor Green
    Write-Host "  ✅ Confirmed bookings: $(($bookings | Where-Object { $_.status -eq 'confirmed' }).Count)" -ForegroundColor Green
    Write-Host "  ✅ Cancelled bookings: $(($bookings | Where-Object { $_.status -eq 'cancelled' }).Count)" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ Error verifying data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Upload Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Visit your MockAPI dashboard to verify the data" -ForegroundColor White
Write-Host "  2. Run 'npm start' to launch your Angular app" -ForegroundColor White
Write-Host "  3. Check that rooms display with correct availability" -ForegroundColor White
Write-Host ""
