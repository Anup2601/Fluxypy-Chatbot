/*
  Warnings:

  - You are about to drop the column `api_key` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `organizations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiKey]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiKey` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_plan_id_fkey";

-- DropIndex
DROP INDEX "organizations_api_key_key";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "api_key",
DROP COLUMN "plan_id",
ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "razorpayCustomerId" TEXT,
ADD COLUMN     "razorpaySubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialGrantedBy" TEXT,
ADD COLUMN     "trialStartDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_apiKey_key" ON "organizations"("apiKey");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
