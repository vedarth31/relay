/*
  Warnings:

  - Added the required column `partNumber` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "link" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "partNumber" TEXT NOT NULL;
