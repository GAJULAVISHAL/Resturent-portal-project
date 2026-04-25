/*
  Warnings:

  - Added the required column `totalPrice` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'PREPARING', 'READY', 'SERVED');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "totalPrice" INTEGER NOT NULL;
