/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `Group` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Group_inviteCode_idx";

-- DropIndex
DROP INDEX "Group_inviteCode_key";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "inviteCode";
