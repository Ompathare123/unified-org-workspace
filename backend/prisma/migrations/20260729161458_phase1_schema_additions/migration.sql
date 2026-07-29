/*
  Warnings:

  - Added the required column `createdById` to the `PRVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceBranch` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetBranch` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedByUserId` to the `SharedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `TicketAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `TicketAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedById` to the `TicketAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "PRVersion" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "diffContent" TEXT;

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "sourceBranch" TEXT NOT NULL,
ADD COLUMN     "targetBranch" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SharedItem" ADD COLUMN     "sharedByUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketAttachment" ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "uploadedById" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "PullRequest_organizationId_idx" ON "PullRequest"("organizationId");

-- AddForeignKey
ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRVersion" ADD CONSTRAINT "PRVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedItem" ADD CONSTRAINT "SharedItem_sharedByUserId_fkey" FOREIGN KEY ("sharedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
