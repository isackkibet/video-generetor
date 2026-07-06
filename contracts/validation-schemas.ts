import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export const createTrendSchema = z.object({
  topic: z.string().min(3).max(180),
  category: z.string().min(2).max(60),
  score: z.coerce.number().min(0).max(100),
  growthRate: z.coerce.number().min(0),
  source: z.string().min(2).max(80),
  region: z.string().min(2).max(80).optional(),
  country: z.string().min(2).max(80).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listTrendsQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
});

export const generateScriptSchema = z.object({
  trendId: uuidSchema,
});

export const listScriptsQuerySchema = paginationQuerySchema.extend({
  trendId: uuidSchema.optional(),
  language: z.string().min(2).max(12).optional(),
});

export const createVideoJobSchema = z.object({
  scriptId: uuidSchema,
  avatarId: uuidSchema.optional(),
  creatorId: uuidSchema.optional(),
});

export const renderVideoSchema = z.object({
  videoId: uuidSchema,
});

export const listVideosQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum([
      "DRAFT",
      "SCRIPTED",
      "RENDERING",
      "MODERATION",
      "APPROVED",
      "PUBLISHED",
      "REJECTED",
      "FAILED",
    ])
    .optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
});

export const moderateVideoSchema = z.object({
  videoId: uuidSchema,
});

export const moderationQueueQuerySchema = paginationQuerySchema.extend({
  action: z.enum(["ALLOW", "LIMIT", "REVIEW", "BLOCK"]).optional(),
});

export const seedFeedQuerySchema = paginationQuerySchema.extend({
  userId: z.string().min(2).max(120),
  region: z.string().optional(),
  country: z.string().optional(),
  language: z.string().min(2).max(12).optional(),
});

export const feedEventSchema = z.object({
  userId: z.string().min(2).max(120),
  videoId: uuidSchema,
  action: z.enum([
    "view",
    "like",
    "share",
    "comment",
    "save",
    "skip",
    "complete",
  ]),
  watchMs: z.coerce.number().int().min(0).optional(),
  region: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(2).max(120),
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const providerJobsQuerySchema = paginationQuerySchema.extend({
  videoId: uuidSchema.optional(),
  jobType: z
    .enum([
      "LLM_SCRIPT",
      "TTS",
      "AVATAR_VIDEO",
      "VIDEO_COMPOSITE",
      "MODERATION",
    ])
    .optional(),
  providerName: z.string().optional(),
  status: z
    .enum(["PENDING", "RUNNING", "SUCCESS", "FAILED", "FALLBACK_USED"])
    .optional(),
  fallbackUsed: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const scriptProviderLogsQuerySchema = paginationQuerySchema.extend({
  scriptId: uuidSchema.optional(),
  trendId: uuidSchema.optional(),
  providerName: z.string().optional(),
  status: z
    .enum(["PENDING", "RUNNING", "SUCCESS", "FAILED", "FALLBACK_USED"])
    .optional(),
  fallbackUsed: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

// Kafka schemas
export const kafkaTrendDiscoveredSchema = z.object({
  trendId: uuidSchema,
  topic: z.string(),
  category: z.string(),
  score: z.number(),
  growthRate: z.number(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export const kafkaScriptCreatedSchema = z.object({
  scriptId: uuidSchema,
  trendId: uuidSchema.nullable().optional(),
  title: z.string(),
  qualityScore: z.number(),
  factScore: z.number(),
});

export const kafkaVideoRenderedSchema = z.object({
  videoId: uuidSchema,
  videoUrl: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  durationSeconds: z.number(),
});

export const kafkaVideoModeratedSchema = z.object({
  videoId: uuidSchema,
  action: z.enum(["ALLOW", "LIMIT", "REVIEW", "BLOCK"]),
  score: z.number(),
  reason: z.string(),
});

export const kafkaVideoPublishedSchema = z.object({
  videoId: uuidSchema,
  publishedAt: z.string(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  language: z.string(),
});

export const kafkaFeedEventCreatedSchema = z.object({
  userId: z.string(),
  videoId: uuidSchema,
  action: z.string(),
  watchMs: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
});

export const eventProcessingQuerySchema = paginationQuerySchema.extend({
  topic: z.string().optional(),
  status: z
    .enum(["RUNNING", "SUCCESS", "FAILED", "RETRIED", "DEAD_LETTERED"])
    .optional(),
});

export const retryEventSchema = z.object({
  idempotencyKey: z.string().min(10),
});
// ============================================================
// Recovery Governance Schemas (Batch 54)
// ============================================================

export const createRecoveryRepositorySchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(120),
  owner: z.string().min(2).max(120),
  repositoryPath: z.string().min(2).max(200),
});

export const updateRecoveryRepositorySchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'CERTIFIED', 'BLOCKED']).optional(),
  alignmentScore: z.coerce.number().int().min(0).max(100).optional(),
  evidenceSubmitted: z.boolean().optional(),
});

export const upsertRecoveryBatchSchema = z.object({
  repositoryId: z.string().uuid(),
  batchNumber: z.coerce.number().int().min(39).max(99),
  title: z.string().min(2).max(200),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'NOT_APPLICABLE']),
  evidenceIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const createRecoveryEvidenceSchema = z.object({
  repositoryId: z.string().uuid(),
  evidenceCode: z.string().min(6).max(80),
  category: z.enum(['TEST', 'API', 'LOG', 'SCREENSHOT', 'METRICS', 'BACKUP', 'CERT', 'DEPLOY', 'SECURITY', 'OTHER']),
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  storageUrl: z.string().optional(),
  submittedBy: z.string().optional(),
});

export const createRecoveryBlockerSchema = z.object({
  repositoryId: z.string().uuid(),
  blockerCode: z.string().min(6).max(80),
  title: z.string().min(2).max(200),
  description: z.string().min(2),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  owner: z.string().optional(),
});

export const createRecoveryRiskSchema = z.object({
  repositoryId: z.string().uuid(),
  riskCode: z.string().min(6).max(80),
  title: z.string().min(2).max(200),
  description: z.string().min(2),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  mitigation: z.string().optional(),
  owner: z.string().optional(),
});

export const governanceStatusUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED', 'REJECTED']),
  resolution: z.string().optional(),
});

export const certificationDecisionSchema = z.object({
  repositoryId: z.string().uuid(),
  certificationType: z.string().min(2).max(80),
  decision: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  reviewer: z.string().optional(),
  comments: z.string().optional(),
});

export const executiveApprovalSchema = z.object({
  releaseVersion: z.string().min(2).max(80),
  decision: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  approver: z.string().optional(),
  comments: z.string().optional(),
});

// ✅ Added: Batch 57 – Export format query
export const exportFormatQuerySchema = z.object({
  format: z.enum(['json', 'csv']).optional()
});
