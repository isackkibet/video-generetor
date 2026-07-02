import { z } from 'zod';

export const createTrendSchema = z.object({
  topic: z.string().min(3).max(180),
  category: z.string().min(2).max(60),
  score: z.number().min(0).max(100),
  growthRate: z.number().min(0),
  source: z.string().min(2),
  region: z.string().optional(),
  country: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const generateScriptSchema = z.object({
  trendId: z.string().uuid(),
});

export const createVideoJobSchema = z.object({
  scriptId: z.string().uuid(),
  avatarId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
});

export const renderVideoSchema = z.object({
  videoId: z.string().uuid(),
});

export const moderateVideoSchema = z.object({
  videoId: z.string().uuid(),
});

export const feedEventSchema = z.object({
  userId: z.string().min(2),
  videoId: z.string().uuid(),
  action: z.enum(['view', 'like', 'share', 'comment', 'save', 'skip', 'complete']),
  watchMs: z.number().min(0).optional(),
  region: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
