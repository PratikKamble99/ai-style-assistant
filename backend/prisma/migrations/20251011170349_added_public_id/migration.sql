/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `style_suggestions` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `user_photos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('BODY_TYPE', 'FACE_SHAPE', 'SKIN_TONE', 'FULL_ANALYSIS');

-- AlterTable
ALTER TABLE "style_suggestions" DROP COLUMN "imageUrl",
ADD COLUMN     "confidence" DOUBLE PRECISION DEFAULT 0.85,
ADD COLUMN     "outfitImageUrl" TEXT,
ADD COLUMN     "styleImageUrl" TEXT,
ALTER COLUMN "bodyType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_photos" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "seasonal_trends" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "popularity" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "colors" TEXT[],
    "keyPieces" TEXT[],
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasonal_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trend_products" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "imageUrl" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "rating" DOUBLE PRECISION,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trend_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "analysisType" "AnalysisType" NOT NULL,
    "detectedValue" TEXT,
    "confidence" DOUBLE PRECISION,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_analyses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trend_products" ADD CONSTRAINT "trend_products_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "seasonal_trends"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_analyses" ADD CONSTRAINT "photo_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
