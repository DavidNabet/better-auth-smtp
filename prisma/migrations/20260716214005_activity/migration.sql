/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `rateLimit` will be added. If there are existing duplicate values, this will fail.
  - Made the column `key` on table `rateLimit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `rateLimit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastRequest` on table `rateLimit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "rateLimit" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "count" SET NOT NULL,
ALTER COLUMN "lastRequest" SET NOT NULL;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT,
    "actorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rateLimit_key_key" ON "rateLimit"("key");
