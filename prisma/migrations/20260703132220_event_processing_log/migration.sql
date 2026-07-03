-- CreateTable
CREATE TABLE "EventProcessingLog" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventProcessingLog_idempotencyKey_key" ON "EventProcessingLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EventProcessingLog_topic_idx" ON "EventProcessingLog"("topic");

-- CreateIndex
CREATE INDEX "EventProcessingLog_status_idx" ON "EventProcessingLog"("status");

-- CreateIndex
CREATE INDEX "EventProcessingLog_createdAt_idx" ON "EventProcessingLog"("createdAt");
