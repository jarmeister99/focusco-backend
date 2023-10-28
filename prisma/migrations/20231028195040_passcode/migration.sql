-- CreateTable
CREATE TABLE "PassCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "PassCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PassCode_code_key" ON "PassCode"("code");
