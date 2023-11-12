/*
  Warnings:

  - You are about to drop the `ScheduledMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScheduledMessage" DROP CONSTRAINT "ScheduledMessage_messageId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "triggerAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "ScheduledMessage";
