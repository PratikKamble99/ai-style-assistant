/*
  Warnings:

  - You are about to drop the column `outfitImageUrl` on the `style_suggestions` table. All the data in the column will be lost.
  - You are about to drop the column `styleImageUrl` on the `style_suggestions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "style_suggestions" DROP COLUMN "outfitImageUrl",
DROP COLUMN "styleImageUrl";

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price_range" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "google_link" TEXT NOT NULL,
    "fit_advice" TEXT NOT NULL,
    "styling_tip" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "style_suggestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
