/*
  Warnings:

  - Added the required column `triggerAt` to the `ScheduledJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduledJob" ADD COLUMN     "triggerAt" TIMESTAMP(3) NOT NULL;
