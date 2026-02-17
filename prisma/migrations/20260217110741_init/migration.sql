/*
  Warnings:

  - A unique constraint covering the columns `[githubDeliveryId]` on the table `PullRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `githubDeliveryId` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "githubDeliveryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_githubDeliveryId_key" ON "PullRequest"("githubDeliveryId");
