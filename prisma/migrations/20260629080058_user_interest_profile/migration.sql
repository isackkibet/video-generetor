-- CreateTable
CREATE TABLE "UserInterestProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "regionScores" JSONB,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInterestProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInterestProfile_userId_key" ON "UserInterestProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInterestProfile_userId_idx" ON "UserInterestProfile"("userId");
