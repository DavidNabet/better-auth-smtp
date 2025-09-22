/*
  Warnings:

  - You are about to drop the `Upvote` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VoteType" AS ENUM ('UP', 'DOWN');

-- DropForeignKey
ALTER TABLE "public"."Upvote" DROP CONSTRAINT "Upvote_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Upvote" DROP CONSTRAINT "Upvote_userId_fkey";

-- DropTable
DROP TABLE "public"."Upvote";

-- CreateTable
CREATE TABLE "public"."Vote" (
    "id" TEXT NOT NULL,
    "type" "public"."VoteType" NOT NULL,
    "userId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_feedbackId_key" ON "public"."Vote"("userId", "feedbackId");

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
