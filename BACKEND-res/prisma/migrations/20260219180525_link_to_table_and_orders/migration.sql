/*
  Warnings:

  - You are about to drop the column `tableNumber` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `tableId` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "tableNumber",
ADD COLUMN     "tableId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
