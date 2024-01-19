/*
  Warnings:

  - You are about to drop the column `autoreply` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thread` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ThreadParticipants` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_threadId_fkey";

-- DropForeignKey
ALTER TABLE "_ThreadParticipants" DROP CONSTRAINT "_ThreadParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_ThreadParticipants" DROP CONSTRAINT "_ThreadParticipants_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "autoreply",
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Thread";

-- DropTable
DROP TABLE "_ThreadParticipants";
