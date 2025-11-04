-- CreateEnum
CREATE TYPE "CommentAction" AS ENUM ('HIDE_COMMENT', 'DELETE_COMMENT', 'WARN_COMMENT');

-- CreateTable
CREATE TABLE "moderationLog" (
    "id" TEXT NOT NULL,
    "action" "CommentAction" NOT NULL DEFAULT 'WARN_COMMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "commentId" TEXT,

    CONSTRAINT "moderationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "moderationLog" ADD CONSTRAINT "moderationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderationLog" ADD CONSTRAINT "moderationLog_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
