/*
  Warnings:

  - Added the required column `vendor` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "vendor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "comments" TEXT;
