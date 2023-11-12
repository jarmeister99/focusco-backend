-- DropForeignKey
ALTER TABLE "CohortUser" DROP CONSTRAINT "CohortUser_cohortId_fkey";

-- DropForeignKey
ALTER TABLE "CohortUser" DROP CONSTRAINT "CohortUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "CohortUser" ADD CONSTRAINT "CohortUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortUser" ADD CONSTRAINT "CohortUser_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
