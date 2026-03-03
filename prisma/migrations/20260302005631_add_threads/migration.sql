-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentCommentId" BIGINT,
ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
