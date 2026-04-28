-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "invitationId" TEXT;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
