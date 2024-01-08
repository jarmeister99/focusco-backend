/*
  Warnings:

  - Made the column `createdAt` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "autoreplyRuleId" INTEGER;

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrl" TEXT,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoreplyRule" (
    "id" SERIAL NOT NULL,
    "userIds" INTEGER[],
    "messageTemplateId" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "delay" INTEGER NOT NULL,

    CONSTRAINT "AutoreplyRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_autoreplyRuleId_fkey" FOREIGN KEY ("autoreplyRuleId") REFERENCES "AutoreplyRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoreplyRule" ADD CONSTRAINT "AutoreplyRule_messageTemplateId_fkey" FOREIGN KEY ("messageTemplateId") REFERENCES "MessageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
