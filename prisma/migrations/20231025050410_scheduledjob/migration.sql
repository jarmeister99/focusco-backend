-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" SERIAL NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "jobType" TEXT NOT NULL,
    "jobData" JSONB NOT NULL,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);
