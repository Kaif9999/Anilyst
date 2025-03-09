-- AlterTable
ALTER TABLE "UsageLimit" ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionId" TEXT;
