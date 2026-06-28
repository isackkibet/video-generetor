-- CreateEnum
CREATE TYPE "ProviderJobType" AS ENUM ('LLM_SCRIPT', 'TTS', 'AVATAR_VIDEO', 'VIDEO_COMPOSITE', 'MODERATION');

-- CreateEnum
CREATE TYPE "ProviderJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'FALLBACK_USED');

-- AlterTable
ALTER TABLE "ModerationLog" ADD COLUMN     "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providerAction" TEXT,
ADD COLUMN     "providerMetadata" JSONB,
ADD COLUMN     "providerName" TEXT;

-- CreateTable
CREATE TABLE "RenderMetadata" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "ttsProvider" TEXT,
    "avatarProvider" TEXT,
    "renderProvider" TEXT,
    "audioUrl" TEXT,
    "avatarVideoUrl" TEXT,
    "composedVideoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "durationSeconds" INTEGER,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderJobLog" (
    "id" TEXT NOT NULL,
    "videoId" TEXT,
    "jobType" "ProviderJobType" NOT NULL,
    "providerName" TEXT NOT NULL,
    "status" "ProviderJobStatus" NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProviderJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RenderMetadata_videoId_key" ON "RenderMetadata"("videoId");

-- CreateIndex
CREATE INDEX "RenderMetadata_ttsProvider_idx" ON "RenderMetadata"("ttsProvider");

-- CreateIndex
CREATE INDEX "RenderMetadata_avatarProvider_idx" ON "RenderMetadata"("avatarProvider");

-- CreateIndex
CREATE INDEX "RenderMetadata_renderProvider_idx" ON "RenderMetadata"("renderProvider");

-- CreateIndex
CREATE INDEX "RenderMetadata_fallbackUsed_idx" ON "RenderMetadata"("fallbackUsed");

-- CreateIndex
CREATE INDEX "ProviderJobLog_videoId_idx" ON "ProviderJobLog"("videoId");

-- CreateIndex
CREATE INDEX "ProviderJobLog_jobType_idx" ON "ProviderJobLog"("jobType");

-- CreateIndex
CREATE INDEX "ProviderJobLog_providerName_idx" ON "ProviderJobLog"("providerName");

-- CreateIndex
CREATE INDEX "ProviderJobLog_status_idx" ON "ProviderJobLog"("status");

-- CreateIndex
CREATE INDEX "ProviderJobLog_fallbackUsed_idx" ON "ProviderJobLog"("fallbackUsed");

-- CreateIndex
CREATE INDEX "ProviderJobLog_startedAt_idx" ON "ProviderJobLog"("startedAt");

-- AddForeignKey
ALTER TABLE "RenderMetadata" ADD CONSTRAINT "RenderMetadata_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderJobLog" ADD CONSTRAINT "ProviderJobLog_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
