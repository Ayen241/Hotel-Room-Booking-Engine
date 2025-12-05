# Reset All Rooms to Available
# This script sets all rooms in MockAPI to isAvailable = true

$API_BASE = "https://6932963ae5a9e342d26fd8e9.mockapi.io"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Reset All Rooms to Available" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Fetch all rooms
    Write-Host "Fetching all rooms..." -ForegroundColor Yellow
    $rooms = Invoke-RestMethod -Uri "$API_BASE/rooms" -Method Get
    Write-Host "  Found $($rooms.Count) rooms" -ForegroundColor Green
    Write-Host ""
    
    # Update each room
    Write-Host "Updating room availability..." -ForegroundColor Yellow
    $successCount = 0
    $errorCount = 0
    
    foreach ($room in $rooms) {
        try {
            # Create a hashtable with all room properties and update isAvailable
            $roomUpdate = @{}
            $room.PSObject.Properties | ForEach-Object {
                if ($_.Name -eq 'isAvailable') {
                    $roomUpdate[$_.Name] = $true
                } else {
                    $roomUpdate[$_.Name] = $_.Value
                }
            }
            
            $body = $roomUpdate | ConvertTo-Json -Compress
            
            $updated = Invoke-RestMethod -Uri "$API_BASE/rooms/$($room.id)" `
                -Method Put `
                -Body $body `
                -ContentType "application/json" `
                -ErrorAction Stop
            
            $successCount++
            Write-Host "  ✅ Room $($room.name) - Now Available" -ForegroundColor Green
            
            # Small delay to avoid rate limiting
            Start-Sleep -Milliseconds 200
        }
        catch {
            $errorCount++
            Write-Host "  ❌ Room $($room.name) - Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  Update Complete!" -ForegroundColor Green
    Write-Host "  Success: $successCount rooms" -ForegroundColor Green
    Write-Host "  Failed: $errorCount rooms" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verify the updates
    Write-Host "Verifying updates..." -ForegroundColor Yellow
    $rooms = Invoke-RestMethod -Uri "$API_BASE/rooms" -Method Get
    $available = ($rooms | Where-Object { $_.isAvailable -eq $true }).Count
    $unavailable = ($rooms | Where-Object { $_.isAvailable -eq $false }).Count
    
    Write-Host "  ✅ Available: $available" -ForegroundColor Green
    Write-Host "  ❌ Unavailable: $unavailable" -ForegroundColor $(if ($unavailable -eq 0) { "Green" } else { "Yellow" })
    Write-Host ""
    
    if ($unavailable -gt 0) {
        Write-Host "⚠️  Some rooms are still unavailable. You may need to run this script again." -ForegroundColor Yellow
    } else {
        Write-Host "✅ All rooms are now available!" -ForegroundColor Green
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Refresh your Angular app (F5)" -ForegroundColor White
Write-Host "  2. All rooms should now show as available" -ForegroundColor White
Write-Host "  3. Try booking a room to test the availability update" -ForegroundColor White
Write-Host ""
