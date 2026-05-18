-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "logo" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "app" ADD COLUMN     "teamId" TEXT;

-- AddForeignKey
ALTER TABLE "app" ADD CONSTRAINT "app_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
