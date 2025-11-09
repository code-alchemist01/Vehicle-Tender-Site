# Comprehensive Endpoint Testing Script
# Tests all endpoints across all microservices

$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHZlaGljbGVhdWN0aW9uLmNvbSIsInN1YiI6ImNtaHI0aHdlcTAwMmYyYTJsY2FsaTg3OWQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjI2ODYxMDksImV4cCI6MTc2MzI5MDkwOX0.Oe4i2756yjgTjKI2zg782UPvZOkZkK8TOtWM65zgXfw"
$adminUserId = "cmhr4hweq002f2a2lcali879d"
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$results = @{}
$testData = @{
    userId = $null
    vehicleId = $null
    categoryId = $null
    auctionId = $null
    bidId = $null
    paymentId = $null
    notificationId = $null
}

function Test-Endpoint {
    param(
        [string]$Service,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$ExpectedStatus = "200",
        [string]$TestName = ""
    )
    
    $resultKey = "$Service-$TestName"
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        $statusCode = 200
        
        $results[$resultKey] = @{
            Status = "✅"
            StatusCode = $statusCode
            Message = "Success"
            Data = $response
        }
        
        Write-Host "  ✅ $Method $Url" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if (-not $statusCode) {
            $statusCode = "ERROR"
        }
        
        $results[$resultKey] = @{
            Status = if ($statusCode -eq $ExpectedStatus) { "⚠️ (Expected)" } else { "❌" }
            StatusCode = $statusCode
            Message = $_.Exception.Message
        }
        
        $color = if ($statusCode -eq $ExpectedStatus) { "Yellow" } else { "Red" }
        Write-Host "  $(if ($statusCode -eq $ExpectedStatus) { '⚠️' } else { '❌' }) $Method $Url - Status: $statusCode" -ForegroundColor $color
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE ENDPOINT TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# 1. AUTH SERVICE TESTS
# ============================================
Write-Host "`n1. AUTH SERVICE (Port: 4001)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Public Endpoints
Write-Host "1.1. Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Auth" -Method "GET" -Url "http://localhost:4001/api/v1/auth/health" -TestName "Health"

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    email = "testuser$timestamp@test.com"
    password = "Test@Pass123"
    firstName = "Test"
    lastName = "User"
}
$registerResponse = Test-Endpoint -Service "Auth" -Method "POST" -Url "http://localhost:4001/api/v1/auth/register" -Body $registerBody -TestName "Register"
if ($registerResponse) {
    $testData.userId = $registerResponse.data.user.id
}

# Try multiple admin credentials
$loginBodies = @(
    @{
        email = "admin@vehicleauction.com"
        password = "Admin@Pass2024"
    },
    @{
        email = "admin@vehicleauction.com"
        password = "admin123"
    }
)
$loginResponse = $null
foreach ($loginBody in $loginBodies) {
    $loginResponse = Test-Endpoint -Service "Auth" -Method "POST" -Url "http://localhost:4001/api/v1/auth/login" -Body $loginBody -TestName "Login"
    if ($loginResponse -and $loginResponse.data) {
        break
    }
}
if ($loginResponse -and $loginResponse.data) {
    $userToken = $loginResponse.data.tokens.accessToken
    $refreshToken = $loginResponse.data.tokens.refreshToken
    $userHeaders = @{
        "Authorization" = "Bearer $userToken"
        "Content-Type" = "application/json"
    }
    
    if ($refreshToken) {
        $refreshBody = @{ refreshToken = $refreshToken }
        Test-Endpoint -Service "Auth" -Method "POST" -Url "http://localhost:4001/api/v1/auth/refresh" -Body $refreshBody -TestName "Refresh"
    }
} else {
    # Use admin token if login fails
    $userHeaders = $adminHeaders
}

# Protected Endpoints
Write-Host "`n1.2. Protected Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Auth" -Method "GET" -Url "http://localhost:4001/api/v1/auth/profile" -Headers $adminHeaders -TestName "Profile"
Test-Endpoint -Service "Auth" -Method "GET" -Url "http://localhost:4001/api/v1/auth/login-history" -Headers $adminHeaders -TestName "LoginHistory"

$changePasswordBody = @{
    currentPassword = "Admin@Pass2024"
    newPassword = "Admin@Pass2024"
}
Test-Endpoint -Service "Auth" -Method "POST" -Url "http://localhost:4001/api/v1/auth/change-password" -Headers $adminHeaders -Body $changePasswordBody -TestName "ChangePassword"

# Admin Endpoints
Write-Host "`n1.3. Admin Endpoints" -ForegroundColor Cyan
$usersResponse = Test-Endpoint -Service "Auth" -Method "GET" -Url "http://localhost:4001/api/v1/users" -Headers $adminHeaders -TestName "Users-List"
if ($usersResponse -and $usersResponse.data.data.Count -gt 0) {
    $testUserId = $usersResponse.data.data[0].id
    Test-Endpoint -Service "Auth" -Method "GET" -Url "http://localhost:4001/api/v1/users/$testUserId" -Headers $adminHeaders -TestName "Users-GetById"
}

# ============================================
# 2. VEHICLE SERVICE TESTS
# ============================================
Write-Host "`n2. VEHICLE SERVICE (Port: 4002)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Public Endpoints
Write-Host "2.1. Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/health" -TestName "Health"
Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/categories" -TestName "Categories-List"

$categoriesResponse = Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/categories" -TestName "Categories-GetAll"
if ($categoriesResponse -and $categoriesResponse.data.Count -gt 0) {
    $testData.categoryId = $categoriesResponse.data[0].id
    Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/categories/$($testData.categoryId)" -TestName "Categories-GetById"
}

Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/vehicles" -TestName "Vehicles-List"
Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/vehicles/search?q=test" -TestName "Vehicles-Search"

$vehiclesResponse = Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/vehicles" -TestName "Vehicles-GetAll"
if ($vehiclesResponse -and $vehiclesResponse.data.vehicles.Count -gt 0) {
    $testData.vehicleId = $vehiclesResponse.data.vehicles[0].id
    Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/vehicles/$($testData.vehicleId)" -TestName "Vehicles-GetById"
}

# Protected Endpoints
Write-Host "`n2.2. Protected Endpoints" -ForegroundColor Cyan
if ($userHeaders) {
    Test-Endpoint -Service "Vehicle" -Method "GET" -Url "http://localhost:4002/api/v1/vehicles/my-vehicles" -Headers $userHeaders -TestName "Vehicles-MyVehicles"
}

# Admin Endpoints
Write-Host "`n2.3. Admin Endpoints" -ForegroundColor Cyan
$categorySlug = "test-category-$(Get-Date -Format 'HHmmss')" -replace '[^a-z0-9-]', ''
$newCategoryBody = @{
    name = "Test Category $(Get-Date -Format 'HHmmss')"
    slug = $categorySlug
    description = "Test category description"
    isActive = $true
}
$newCategoryResponse = Test-Endpoint -Service "Vehicle" -Method "POST" -Url "http://localhost:4002/api/v1/categories" -Headers $adminHeaders -Body $newCategoryBody -TestName "Categories-Create"
if ($newCategoryResponse) {
    $newCategoryId = $newCategoryResponse.data.id
    $updateCategoryBody = @{ description = "Updated description" }
    Test-Endpoint -Service "Vehicle" -Method "PATCH" -Url "http://localhost:4002/api/v1/categories/$newCategoryId" -Headers $adminHeaders -Body $updateCategoryBody -TestName "Categories-Update"
    Test-Endpoint -Service "Vehicle" -Method "DELETE" -Url "http://localhost:4002/api/v1/categories/$newCategoryId" -Headers $adminHeaders -ExpectedStatus "200" -TestName "Categories-Delete"
}

# ============================================
# 3. AUCTION SERVICE TESTS
# ============================================
Write-Host "`n3. AUCTION SERVICE (Port: 4003)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Public Endpoints
Write-Host "3.1. Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Auction" -Method "GET" -Url "http://localhost:4003/health" -TestName "Health"
Test-Endpoint -Service "Auction" -Method "GET" -Url "http://localhost:4003/auctions" -TestName "Auctions-List"
Test-Endpoint -Service "Auction" -Method "GET" -Url "http://localhost:4003/auctions/stats" -TestName "Auctions-Stats"

$auctionsResponse = Test-Endpoint -Service "Auction" -Method "GET" -Url "http://localhost:4003/auctions" -TestName "Auctions-GetAll"
if ($auctionsResponse -and $auctionsResponse.data.Count -gt 0) {
    $testData.auctionId = $auctionsResponse.data[0].id
    Test-Endpoint -Service "Auction" -Method "GET" -Url "http://localhost:4003/auctions/$($testData.auctionId)" -TestName "Auctions-GetById"
}

# Protected Endpoints
Write-Host "`n3.2. Protected Endpoints" -ForegroundColor Cyan
if ($userHeaders -and $testData.vehicleId) {
    $newAuctionBody = @{
        title = "Test Auction $(Get-Date -Format 'HHmmss')"
        description = "Test auction description"
        vehicleId = $testData.vehicleId
        sellerId = $adminUserId
        startingPrice = 100000
        reservePrice = 120000
        minBidIncrement = 5000
        startTime = (Get-Date).AddHours(1).ToUniversalTime().ToString("o")
        endTime = (Get-Date).AddDays(7).ToUniversalTime().ToString("o")
    }
    $newAuctionResponse = Test-Endpoint -Service "Auction" -Method "POST" -Url "http://localhost:4003/auctions" -Headers $adminHeaders -Body $newAuctionBody -TestName "Auctions-Create"
    
    if ($testData.auctionId) {
        $watchlistBody = @{ userId = $adminUserId }
        Test-Endpoint -Service "Auction" -Method "POST" -Url "http://localhost:4003/auctions/$($testData.auctionId)/watchlist" -Headers $adminHeaders -Body $watchlistBody -TestName "Auctions-Watchlist-Add"
        Test-Endpoint -Service "Auction" -Method "DELETE" -Url "http://localhost:4003/auctions/$($testData.auctionId)/watchlist/$adminUserId" -Headers $adminHeaders -TestName "Auctions-Watchlist-Remove"
    }
}

Test-Endpoint -Service "Auction" -Method "POST" -Url "http://localhost:4003/auctions/update-statuses" -Headers $adminHeaders -TestName "Auctions-UpdateStatuses"

# ============================================
# 4. BID SERVICE TESTS
# ============================================
Write-Host "`n4. BID SERVICE (Port: 4004)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Public Endpoints
Write-Host "4.1. Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/health" -TestName "Health"
Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids" -TestName "Bids-List"
Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids/statistics" -TestName "Bids-Statistics"

if ($testData.auctionId) {
    Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids/auction/$($testData.auctionId)" -TestName "Bids-ByAuction"
    Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids/auction/$($testData.auctionId)/highest" -TestName "Bids-Highest"
}

Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids/user/$adminUserId" -TestName "Bids-ByUser"
Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids/auto/user/$adminUserId" -TestName "Bids-AutoBids"

$bidsResponse = Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids" -TestName "Bids-GetAll"
if ($bidsResponse -and $bidsResponse.data.Count -gt 0) {
    $testData.bidId = $bidsResponse.data[0].id
    Test-Endpoint -Service "Bid" -Method "GET" -Url "http://localhost:4004/bids/$($testData.bidId)" -TestName "Bids-GetById"
}

# Protected Endpoints
Write-Host "`n4.2. Protected Endpoints" -ForegroundColor Cyan
if ($userHeaders -and $testData.auctionId) {
    # Get auction to check current price
    try {
        $auctionDetails = Invoke-RestMethod -Uri "http://localhost:4003/auctions/$($testData.auctionId)" -Method GET
        $currentPrice = [double]$auctionDetails.data.currentPrice
        $minBidIncrement = [double]$auctionDetails.data.minBidIncrement
        $bidAmount = $currentPrice + $minBidIncrement
        
        $newBidBody = @{
            auctionId = $testData.auctionId
            bidderId = $adminUserId
            amount = $bidAmount
        }
        
        # Only create bid if auction is ACTIVE
        if ($auctionDetails.data.status -eq "ACTIVE") {
            $newBidResponse = Test-Endpoint -Service "Bid" -Method "POST" -Url "http://localhost:4004/bids" -Headers $adminHeaders -Body $newBidBody -TestName "Bids-Create"
        } else {
            Write-Host "  ⚠️ POST /bids - Auction is not ACTIVE (Status: $($auctionDetails.data.status))" -ForegroundColor Yellow
            $results["Bid-Bids-Create"] = @{
                Status = "⚠️"
                StatusCode = "SKIPPED"
                Message = "Auction is not ACTIVE"
            }
        }
    } catch {
        Write-Host "  ⚠️ POST /bids - Could not check auction status" -ForegroundColor Yellow
    }
    
    $autoBidBody = @{
        auctionId = $testData.auctionId
        bidderId = $adminUserId
        maxAmount = 200000
        increment = 5000
    }
    $autoBidResponse = Test-Endpoint -Service "Bid" -Method "POST" -Url "http://localhost:4004/bids/auto" -Headers $adminHeaders -Body $autoBidBody -TestName "Bids-AutoBid-Create"
    if ($autoBidResponse) {
        $autoBidId = $autoBidResponse.data.id
        Test-Endpoint -Service "Bid" -Method "DELETE" -Url "http://localhost:4004/bids/auto/$autoBidId/user/$adminUserId" -Headers $adminHeaders -TestName "Bids-AutoBid-Delete"
    }
}

# ============================================
# 5. PAYMENT SERVICE TESTS
# ============================================
Write-Host "`n5. PAYMENT SERVICE (Port: 4005)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Public Endpoints
Write-Host "5.1. Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/health" -TestName "Health"
$stripeTestResponse = Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/payments/test-stripe" -TestName "Test-Stripe"
if ($stripeTestResponse -and -not $stripeTestResponse.success) {
    Write-Host "  ⚠️ Stripe API key is not valid (expected for test environment)" -ForegroundColor Yellow
}

# Protected Endpoints
Write-Host "`n5.2. Protected Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/payments/statistics" -Headers $adminHeaders -TestName "Payments-Statistics"

if ($testData.auctionId) {
    Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/payments/auction/$($testData.auctionId)" -Headers $adminHeaders -TestName "Payments-ByAuction"
}

Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/payments/bidder/$adminUserId" -Headers $adminHeaders -TestName "Payments-ByBidder"

$paymentsResponse = Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/payments/auction/$($testData.auctionId)" -Headers $adminHeaders -TestName "Payments-GetByAuction"
if ($paymentsResponse -and $paymentsResponse.data.Count -gt 0) {
    $testData.paymentId = $paymentsResponse.data[0].id
    Test-Endpoint -Service "Payment" -Method "GET" -Url "http://localhost:4005/payments/$($testData.paymentId)" -Headers $adminHeaders -TestName "Payments-GetById"
}

# ============================================
# 6. NOTIFICATION SERVICE TESTS
# ============================================
Write-Host "`n6. NOTIFICATION SERVICE (Port: 4006)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Public Endpoints
Write-Host "6.1. Public Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Notification" -Method "GET" -Url "http://localhost:4006/notifications/health" -TestName "Health"

# Protected Endpoints
Write-Host "`n6.2. Protected Endpoints" -ForegroundColor Cyan
Test-Endpoint -Service "Notification" -Method "GET" -Url "http://localhost:4006/notifications?userId=$adminUserId" -TestName "Notifications-List"
Test-Endpoint -Service "Notification" -Method "GET" -Url "http://localhost:4006/notifications/unread-count/$adminUserId" -TestName "Notifications-UnreadCount"

$notificationsResponse = Test-Endpoint -Service "Notification" -Method "GET" -Url "http://localhost:4006/notifications?userId=$adminUserId" -TestName "Notifications-GetAll"
if ($notificationsResponse -and $notificationsResponse.data.Count -gt 0) {
    $testData.notificationId = $notificationsResponse.data[0].id
    Test-Endpoint -Service "Notification" -Method "GET" -Url "http://localhost:4006/notifications/$($testData.notificationId)" -TestName "Notifications-GetById"
    
    if ($testData.notificationId) {
        Test-Endpoint -Service "Notification" -Method "PATCH" -Url "http://localhost:4006/notifications/$($testData.notificationId)/read" -Headers $adminHeaders -TestName "Notifications-MarkRead"
    }
}

$newNotificationBody = @{
    userId = $adminUserId
    type = "BID_PLACED"
    title = "Test Notification"
    message = "This is a test notification"
    data = @{
        auctionId = $testData.auctionId
        bidAmount = 150000
    }
    read = $false
}
$newNotificationResponse = Test-Endpoint -Service "Notification" -Method "POST" -Url "http://localhost:4006/notifications" -Headers $adminHeaders -Body $newNotificationBody -TestName "Notifications-Create"

Test-Endpoint -Service "Notification" -Method "PATCH" -Url "http://localhost:4006/notifications/user/$adminUserId/read-all" -Headers $adminHeaders -TestName "Notifications-MarkAllRead"

# ============================================
# TEST SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$successCount = 0
$expectedFailCount = 0
$failCount = 0
$totalCount = $results.Count

foreach ($result in $results.Values) {
    if ($result.Status -eq "✅") {
        $successCount++
    } elseif ($result.Status -eq "⚠️ (Expected)") {
        $expectedFailCount++
    } else {
        $failCount++
    }
}

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "⚠️ Expected Failures: $expectedFailCount" -ForegroundColor Yellow
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "`nSuccess Rate: $([math]::Round(($successCount / $totalCount) * 100, 2))%" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DETAILED RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results.GetEnumerator() | Sort-Object Name | ForEach-Object {
    $key = $_.Key
    $value = $_.Value
    Write-Host "$($value.Status) $key - Status: $($value.StatusCode)" -ForegroundColor $(if ($value.Status -eq "✅") { "Green" } elseif ($value.Status -eq "⚠️ (Expected)") { "Yellow" } else { "Red" })
    if ($value.Message -and $value.Status -ne "✅") {
        Write-Host "    Message: $($value.Message)" -ForegroundColor Gray
    }
}

# Save results to file
$resultsJson = $results | ConvertTo-Json -Depth 10
$resultsFile = "test_results_$(Get-Date -Format 'yyyyMMddHHmmss').json"
$resultsJson | Out-File -FilePath $resultsFile -Encoding UTF8

Write-Host "`n✅ Test results saved to test_results_*.json" -ForegroundColor Green

