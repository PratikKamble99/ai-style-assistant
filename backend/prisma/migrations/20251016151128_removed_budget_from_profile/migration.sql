/*
  Warnings:

  - You are about to drop the column `budgetRange` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `styleType` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "budgetRange",
DROP COLUMN "styleType";
