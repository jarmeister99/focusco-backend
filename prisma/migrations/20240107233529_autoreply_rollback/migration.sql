/*
  Warnings:

  - You are about to drop the column `autoreplyRuleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AutoreplyRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AutoreplyRule" DROP CONSTRAINT "AutoreplyRule_messageTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_autoreplyRuleId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "autoreplyRuleId";

-- DropTable
DROP TABLE "AutoreplyRule";

-- DropTable
DROP TABLE "MessageTemplate";
