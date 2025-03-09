/*
  Warnings:

  - You are about to drop the column `maxAnalyses` on the `UsageLimit` table. All the data in the column will be lost.
  - You are about to drop the column `maxVisualizations` on the `UsageLimit` table. All the data in the column will be lost.
  - Made the column `subscriptionStatus` on table `UsageLimit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UsageLimit" DROP COLUMN "maxAnalyses",
DROP COLUMN "maxVisualizations",
ADD COLUMN     "analysisLimit" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "visualizationLimit" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "subscriptionStatus" SET NOT NULL,
ALTER COLUMN "subscriptionStatus" SET DEFAULT 'active';
