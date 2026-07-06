-- CreateEnum
CREATE TYPE "RecoveryRepositoryStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'CERTIFIED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "RecoveryBatchStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "EvidenceCategory" AS ENUM ('TEST', 'API', 'LOG', 'SCREENSHOT', 'METRICS', 'BACKUP', 'CERT', 'DEPLOY', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "GovernanceSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "GovernanceItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CertificationDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "RecoveryRepository" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repositoryPath" TEXT NOT NULL,
    "status" "RecoveryRepositoryStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "alignmentScore" INTEGER NOT NULL DEFAULT 0,
    "evidenceSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "certifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryBatchCompletion" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "batchNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "RecoveryBatchStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryBatchCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryEvidence" (
    "id" TEXT NOT NULL,
    "evidenceCode" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "category" "EvidenceCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "storageUrl" TEXT,
    "submittedBy" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryBlocker" (
    "id" TEXT NOT NULL,
    "blockerCode" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "GovernanceSeverity" NOT NULL,
    "status" "GovernanceItemStatus" NOT NULL DEFAULT 'OPEN',
    "owner" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryBlocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryRisk" (
    "id" TEXT NOT NULL,
    "riskCode" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "GovernanceSeverity" NOT NULL,
    "status" "GovernanceItemStatus" NOT NULL DEFAULT 'OPEN',
    "mitigation" TEXT,
    "owner" TEXT,
    "acceptedBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryCertification" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "certificationType" TEXT NOT NULL,
    "decision" "CertificationDecision" NOT NULL DEFAULT 'PENDING',
    "reviewer" TEXT,
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveRecoveryApproval" (
    "id" TEXT NOT NULL,
    "releaseVersion" TEXT NOT NULL,
    "decision" "CertificationDecision" NOT NULL DEFAULT 'PENDING',
    "approver" TEXT,
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutiveRecoveryApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryRepository_code_key" ON "RecoveryRepository"("code");

-- CreateIndex
CREATE INDEX "RecoveryRepository_status_idx" ON "RecoveryRepository"("status");

-- CreateIndex
CREATE INDEX "RecoveryRepository_alignmentScore_idx" ON "RecoveryRepository"("alignmentScore");

-- CreateIndex
CREATE INDEX "RecoveryBatchCompletion_batchNumber_idx" ON "RecoveryBatchCompletion"("batchNumber");

-- CreateIndex
CREATE INDEX "RecoveryBatchCompletion_status_idx" ON "RecoveryBatchCompletion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryBatchCompletion_repositoryId_batchNumber_key" ON "RecoveryBatchCompletion"("repositoryId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryEvidence_evidenceCode_key" ON "RecoveryEvidence"("evidenceCode");

-- CreateIndex
CREATE INDEX "RecoveryEvidence_repositoryId_idx" ON "RecoveryEvidence"("repositoryId");

-- CreateIndex
CREATE INDEX "RecoveryEvidence_category_idx" ON "RecoveryEvidence"("category");

-- CreateIndex
CREATE INDEX "RecoveryEvidence_accepted_idx" ON "RecoveryEvidence"("accepted");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryBlocker_blockerCode_key" ON "RecoveryBlocker"("blockerCode");

-- CreateIndex
CREATE INDEX "RecoveryBlocker_severity_idx" ON "RecoveryBlocker"("severity");

-- CreateIndex
CREATE INDEX "RecoveryBlocker_status_idx" ON "RecoveryBlocker"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryRisk_riskCode_key" ON "RecoveryRisk"("riskCode");

-- CreateIndex
CREATE INDEX "RecoveryRisk_severity_idx" ON "RecoveryRisk"("severity");

-- CreateIndex
CREATE INDEX "RecoveryRisk_status_idx" ON "RecoveryRisk"("status");

-- CreateIndex
CREATE INDEX "RecoveryCertification_decision_idx" ON "RecoveryCertification"("decision");

-- CreateIndex
CREATE INDEX "RecoveryCertification_certificationType_idx" ON "RecoveryCertification"("certificationType");

-- CreateIndex
CREATE INDEX "ExecutiveRecoveryApproval_releaseVersion_idx" ON "ExecutiveRecoveryApproval"("releaseVersion");

-- CreateIndex
CREATE INDEX "ExecutiveRecoveryApproval_decision_idx" ON "ExecutiveRecoveryApproval"("decision");

-- AddForeignKey
ALTER TABLE "RecoveryBatchCompletion" ADD CONSTRAINT "RecoveryBatchCompletion_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RecoveryRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryEvidence" ADD CONSTRAINT "RecoveryEvidence_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RecoveryRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryBlocker" ADD CONSTRAINT "RecoveryBlocker_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RecoveryRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryRisk" ADD CONSTRAINT "RecoveryRisk_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RecoveryRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryCertification" ADD CONSTRAINT "RecoveryCertification_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "RecoveryRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
