/*
  Warnings:

  - You are about to drop the `ScheduledJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isSent" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ScheduledJob";

-- CreateTable
CREATE TABLE "ScheduledMessage" (
    "id" SERIAL NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "triggerAt" TIMESTAMP(3) NOT NULL,
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMessage_messageId_key" ON "ScheduledMessage"("messageId");

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
