/*
  Warnings:

  - You are about to drop the `PassCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PassCode";

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrl" TEXT,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledMessage" (
    "id" SERIAL NOT NULL,
    "messageTemplateId" INTEGER NOT NULL,
    "triggerAt" TIMESTAMP(3) NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentMessage" (
    "id" SERIAL NOT NULL,
    "messageTemplateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "SentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoreplyMessageRule" (
    "id" SERIAL NOT NULL,
    "messageTemplateId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoreplyMessageRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAutoreplyMessageRule" (
    "userId" INTEGER NOT NULL,
    "autoreplyMessageRuleId" INTEGER NOT NULL,

    CONSTRAINT "UserAutoreplyMessageRule_pkey" PRIMARY KEY ("userId","autoreplyMessageRuleId")
);

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_messageTemplateId_fkey" FOREIGN KEY ("messageTemplateId") REFERENCES "MessageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_messageTemplateId_fkey" FOREIGN KEY ("messageTemplateId") REFERENCES "MessageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoreplyMessageRule" ADD CONSTRAINT "AutoreplyMessageRule_messageTemplateId_fkey" FOREIGN KEY ("messageTemplateId") REFERENCES "MessageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAutoreplyMessageRule" ADD CONSTRAINT "UserAutoreplyMessageRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAutoreplyMessageRule" ADD CONSTRAINT "UserAutoreplyMessageRule_autoreplyMessageRuleId_fkey" FOREIGN KEY ("autoreplyMessageRuleId") REFERENCES "AutoreplyMessageRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
