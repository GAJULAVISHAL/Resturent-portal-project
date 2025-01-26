/*
  Warnings:

  - The values [APPETIZER,MAIN_COURSE,DESSERT,BEVERAGE] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('JUICE', 'MILKSHAKE', 'SMOOTHIE', 'SALAD', 'SHARJAH', 'LASSI', 'MOJITO', 'FALOODA', 'CHAAT', 'FRIES');
ALTER TABLE "MenuItem" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "description";
