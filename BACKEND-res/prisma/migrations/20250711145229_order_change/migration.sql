/*
  Warnings:

  - Changed the type of `tableNumber` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "tableNumber",
ADD COLUMN     "tableNumber" INTEGER NOT NULL;
