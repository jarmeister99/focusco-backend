-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isVcf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mediaUrl" TEXT;
