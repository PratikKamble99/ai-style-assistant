/*
  Warnings:

  - Added the required column `purchaseLink` to the `product_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store` to the `product_recommendations` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `product_recommendations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProductCategoryType" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORIES', 'JEWELRY', 'BAG');

-- AlterEnum
ALTER TYPE "AnalysisType" ADD VALUE 'BODY_MEASUREMENTS';

-- AlterTable
ALTER TABLE "product_recommendations" ADD COLUMN     "fitAdvice" TEXT,
ADD COLUMN     "purchaseLink" TEXT NOT NULL,
ADD COLUMN     "store" TEXT NOT NULL,
ADD COLUMN     "stylingTip" TEXT,
ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "brand" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE TEXT,
ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "productUrl" DROP NOT NULL,
ALTER COLUMN "platform" DROP NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "measurements" TEXT;
