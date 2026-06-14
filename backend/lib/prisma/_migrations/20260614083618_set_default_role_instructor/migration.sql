-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'INSTRUCTOR';

-- CreateIndex
CREATE INDEX "Meeting_scheduledAt_idx" ON "Meeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "Meeting_status_hostId_idx" ON "Meeting"("status", "hostId");
