/*
  Warnings:

  - You are about to drop the `auctions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bids` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auctions" DROP CONSTRAINT "auctions_userId_fkey";

-- DropForeignKey
ALTER TABLE "auctions" DROP CONSTRAINT "auctions_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "auctions" DROP CONSTRAINT "auctions_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "bids" DROP CONSTRAINT "bids_auctionId_fkey";

-- DropForeignKey
ALTER TABLE "bids" DROP CONSTRAINT "bids_userId_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_userId_fkey";

-- DropTable
DROP TABLE "auctions";

-- DropTable
DROP TABLE "bids";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "vehicles";

-- DropEnum
DROP TYPE "AuctionStatus";

-- DropEnum
DROP TYPE "FuelType";

-- DropEnum
DROP TYPE "TransmissionType";

-- DropEnum
DROP TYPE "VehicleCondition";

-- DropEnum
DROP TYPE "VehicleStatus";
