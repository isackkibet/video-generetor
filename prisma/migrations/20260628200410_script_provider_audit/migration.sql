-- CreateTable
CREATE TABLE "ScriptProviderLog" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT,
    "trendId" TEXT,
    "providerName" TEXT NOT NULL,
    "status" "ProviderJobStatus" NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScriptProviderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScriptProviderLog_scriptId_idx" ON "ScriptProviderLog"("scriptId");

-- CreateIndex
CREATE INDEX "ScriptProviderLog_trendId_idx" ON "ScriptProviderLog"("trendId");

-- CreateIndex
CREATE INDEX "ScriptProviderLog_providerName_idx" ON "ScriptProviderLog"("providerName");

-- CreateIndex
CREATE INDEX "ScriptProviderLog_status_idx" ON "ScriptProviderLog"("status");

-- CreateIndex
CREATE INDEX "ScriptProviderLog_fallbackUsed_idx" ON "ScriptProviderLog"("fallbackUsed");

-- CreateIndex
CREATE INDEX "ScriptProviderLog_startedAt_idx" ON "ScriptProviderLog"("startedAt");

-- AddForeignKey
ALTER TABLE "ScriptProviderLog" ADD CONSTRAINT "ScriptProviderLog_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptProviderLog" ADD CONSTRAINT "ScriptProviderLog_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
