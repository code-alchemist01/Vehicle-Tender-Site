-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'OUTBID');

-- CreateEnum
CREATE TYPE "BidAction" AS ENUM ('PLACED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'OUTBID', 'AUTO_BID_TRIGGERED');

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "maxAmount" DECIMAL(10,2),
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_history" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "BidAction" NOT NULL,

    CONSTRAINT "bid_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_bids" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "maxAmount" DECIMAL(10,2) NOT NULL,
    "increment" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_validations" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "validations" JSONB NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "errors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_validations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bids_auctionId_idx" ON "bids"("auctionId");

-- CreateIndex
CREATE INDEX "bids_bidderId_idx" ON "bids"("bidderId");

-- CreateIndex
CREATE INDEX "bids_placedAt_idx" ON "bids"("placedAt");

-- CreateIndex
CREATE INDEX "bids_status_idx" ON "bids"("status");

-- CreateIndex
CREATE INDEX "bid_history_bidId_idx" ON "bid_history"("bidId");

-- CreateIndex
CREATE INDEX "bid_history_auctionId_idx" ON "bid_history"("auctionId");

-- CreateIndex
CREATE INDEX "bid_history_timestamp_idx" ON "bid_history"("timestamp");

-- CreateIndex
CREATE INDEX "auto_bids_auctionId_idx" ON "auto_bids"("auctionId");

-- CreateIndex
CREATE INDEX "auto_bids_bidderId_idx" ON "auto_bids"("bidderId");

-- CreateIndex
CREATE INDEX "auto_bids_isActive_idx" ON "auto_bids"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "auto_bids_auctionId_bidderId_key" ON "auto_bids"("auctionId", "bidderId");

-- CreateIndex
CREATE UNIQUE INDEX "bid_validations_bidId_key" ON "bid_validations"("bidId");

-- CreateIndex
CREATE INDEX "bid_validations_auctionId_idx" ON "bid_validations"("auctionId");

-- CreateIndex
CREATE INDEX "bid_validations_bidderId_idx" ON "bid_validations"("bidderId");

-- CreateIndex
CREATE INDEX "bid_validations_isValid_idx" ON "bid_validations"("isValid");
