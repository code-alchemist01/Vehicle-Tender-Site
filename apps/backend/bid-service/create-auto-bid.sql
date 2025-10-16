INSERT INTO "AutoBid" (
  "id",
  "auctionId", 
  "bidderId", 
  "maxAmount", 
  "increment", 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'test-auto-bid-001',
  'cmgsiwinv0001ucvbfrsu87y8',
  'cmgsqsqdg0001ucvb3d4cadcd',
  8000.00,
  250.00,
  true,
  NOW(),
  NOW()
) ON CONFLICT ("auctionId", "bidderId") DO UPDATE SET
  "maxAmount" = EXCLUDED."maxAmount",
  "increment" = EXCLUDED."increment",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();