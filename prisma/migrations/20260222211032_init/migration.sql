-- CreateTable
CREATE TABLE "Comment" (
    "id" BIGINT NOT NULL,
    "body" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pullRequestId" BIGINT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
