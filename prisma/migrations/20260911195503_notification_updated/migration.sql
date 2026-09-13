/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `invitationId` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[membershipKey]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `verification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `verification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_invitationId_fkey";

-- AlterTable
ALTER TABLE "team" ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "teamMember" ADD COLUMN     "membershipKey" TEXT,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "expiresAt",
DROP COLUMN "invitationId",
DROP COLUMN "link",
DROP COLUMN "message",
DROP COLUMN "status",
ADD COLUMN     "body" TEXT,
ADD COLUMN     "data" JSONB,
ADD COLUMN     "href" TEXT,
ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "twoFactor" ADD COLUMN     "failedVerificationCount" INTEGER DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "banned" SET DEFAULT false,
ALTER COLUMN "twoFactorEnabled" DROP NOT NULL;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "team_organizationId_idx" ON "team"("organizationId");

-- CreateIndex
CREATE INDEX "teamMember_teamId_idx" ON "teamMember"("teamId");

-- CreateIndex
CREATE INDEX "teamMember_userId_idx" ON "teamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teamMember_membershipKey_key" ON "teamMember"("membershipKey");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "invitation"("organizationId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "member"("organizationId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

-- CreateIndex
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor"("secret");

-- CreateIndex
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor"("userId");
