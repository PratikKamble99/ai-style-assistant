/*
  Warnings:

  - You are about to drop the `product_recommendations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Outfit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_recommendations" DROP CONSTRAINT "product_recommendations_suggestionId_fkey";

-- AlterTable
ALTER TABLE "Outfit" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "product_recommendations";

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
