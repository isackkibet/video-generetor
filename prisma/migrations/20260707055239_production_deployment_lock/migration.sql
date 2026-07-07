-- CreateEnum
CREATE TYPE "DeploymentLockDecision" AS ENUM ('GO', 'NO_GO');

-- CreateEnum
CREATE TYPE "DeploymentLockStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'BLOCKED', 'DEPLOYED', 'REVOKED');

-- CreateTable
CREATE TABLE "ProductionDeploymentLock" (
    "id" TEXT NOT NULL,
    "releaseVersion" TEXT NOT NULL,
    "evidenceBundleId" TEXT NOT NULL,
    "executiveDecision" "DeploymentLockDecision" NOT NULL,
    "authorizationSigned" BOOLEAN NOT NULL DEFAULT false,
    "authorizedBy" TEXT,
    "authorizationReference" TEXT,
    "deploymentStatus" "DeploymentLockStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorizedAt" TIMESTAMP(3),
    "deployedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ProductionDeploymentLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionDeploymentLock_releaseVersion_key" ON "ProductionDeploymentLock"("releaseVersion");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionDeploymentLock_evidenceBundleId_key" ON "ProductionDeploymentLock"("evidenceBundleId");
