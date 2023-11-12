-- CreateTable
CREATE TABLE "Cohort" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortUser" (
    "userId" INTEGER NOT NULL,
    "cohortId" INTEGER NOT NULL,

    CONSTRAINT "CohortUser_pkey" PRIMARY KEY ("userId","cohortId")
);

-- AddForeignKey
ALTER TABLE "CohortUser" ADD CONSTRAINT "CohortUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortUser" ADD CONSTRAINT "CohortUser_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
