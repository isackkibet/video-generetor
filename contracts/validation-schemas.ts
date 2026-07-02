import { z } from 'zod';

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
      'DRAFT',
      'SCRIPTED',
      'RENDERING',
      'MODERATION',
      'APPROVED',
      'PUBLISHED',
      'REJECTED',
      'FAILED',
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
  action: z.enum(['ALLOW', 'LIMIT', 'REVIEW', 'BLOCK']).optional(),
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
  action: z.enum(['view', 'like', 'share', 'comment', 'save', 'skip', 'complete']),
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
    .enum(['LLM_SCRIPT', 'TTS', 'AVATAR_VIDEO', 'VIDEO_COMPOSITE', 'MODERATION'])
    .optional(),
  providerName: z.string().optional(),
  status: z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'FALLBACK_USED']).optional(),
  fallbackUsed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const scriptProviderLogsQuerySchema = paginationQuerySchema.extend({
  scriptId: uuidSchema.optional(),
  trendId: uuidSchema.optional(),
  providerName: z.string().optional(),
  status: z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'FALLBACK_USED']).optional(),
  fallbackUsed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
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
  action: z.enum(['ALLOW', 'LIMIT', 'REVIEW', 'BLOCK']),
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
