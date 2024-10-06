-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ENGINEER', 'FINANCE', 'OPERATIONS', 'BUSINESS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('TO_ORDER', 'PLACED', 'PROCESSED', 'SHIPPED', 'PARTIAL', 'DELIVERED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('TO_ORDER', 'PLACED', 'PROCESSED', 'SHIPPED', 'DELIVERED', 'PICKED_UP');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "subteam" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "internalOrderId" TEXT NOT NULL,
    "meenOrderId" TEXT,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "subteam" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "vendor" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "costVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "internalItemId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "priceVerified" BOOLEAN NOT NULL DEFAULT false,
    "carrier" TEXT,
    "trackingId" TEXT,
    "status" "ItemStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_internalOrderId_key" ON "Order"("internalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_internalItemId_key" ON "Item"("internalItemId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
