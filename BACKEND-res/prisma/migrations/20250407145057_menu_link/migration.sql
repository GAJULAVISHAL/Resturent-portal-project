/*
  Warnings:

  - Added the required column `adminId` to the `MenuItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_adminCode_key";

-- AlterTable
ALTER TABLE "MenuItems" ADD COLUMN     "adminId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MenuItems" ADD CONSTRAINT "MenuItems_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
