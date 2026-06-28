import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import { publishEvent } from "../../shared/kafka";
import { env } from "../../shared/env";
import { KafkaTopics } from "../../../contracts/kafka-events";
import {
  CreateVideoJobRequest,
  RenderVideoRequest,
} from "../../../contracts/api-contracts";
import { MediaRenderPipeline } from "./media-render.pipeline";

type VideoStatus =
  | "DRAFT"
  | "SCRIPTED"
  | "RENDERING"
  | "MODERATION"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "FAILED";

@Injectable()
export class RenderService {
  private readonly mediaPipeline: MediaRenderPipeline;

  constructor(private readonly prisma: PrismaService) {
    this.mediaPipeline = new MediaRenderPipeline(this.prisma);
  }

  async createVideoJob(input: CreateVideoJobRequest) {
    const script = await this.prisma.script.findUnique({
      where: { id: input.scriptId },
      include: {
        trend: true,
      },
    });

    if (!script) {
      throw new NotFoundException(`Script not found: ${input.scriptId}`);
    }

    let avatarId = input.avatarId;

    if (!avatarId) {
      const avatar = await this.prisma.avatar.findFirst({
        where: {
          isActive: true,
          OR: [
            { category: script.trend?.category || "general" },
            { category: "general" },
            { category: "motivation" },
            { category: "campus" },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      avatarId = avatar?.id;
    }

    const video = await this.prisma.video.create({
      data: {
        creatorId: input.creatorId,
        avatarId,
        scriptId: script.id,
        title: script.title,
        category: script.trend?.category || "seed_content",
        region: script.trend?.region,
        country: script.trend?.country,
        language: script.language,
        durationSeconds: script.durationHint,
        isSeedContent: true,
        status: "SCRIPTED",
      },
    });

    await publishEvent(
      KafkaTopics.VIDEO_RENDER_REQUESTED,
      {
        videoId: video.id,
        scriptId: script.id,
        avatarId,
      },
      video.id,
    );

    return video;
  }

  async createJobsForUnrenderedScripts(take = 20) {
    const scripts = await this.prisma.script.findMany({
      where: {
        videos: {
          none: {},
        },
      },
      include: {
        trend: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    });

    const created = [];
    for (const script of scripts) {
      created.push(
        await this.createVideoJob({
          scriptId: script.id,
        }),
      );
    }
    return created;
  }

  async renderVideo(input: RenderVideoRequest) {
    const video = await this.prisma.video.findUnique({
      where: { id: input.videoId },
      include: {
        script: true,
        avatar: true,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video not found: ${input.videoId}`);
    }

    if (!video.script) {
      throw new Error(`Video ${video.id} cannot render without a script`);
    }

    await this.markVideoStatus(video.id, "RENDERING");

    const scriptText = [video.script.hook, video.script.body, video.script.cta]
      .filter(Boolean)
      .join("\n\n");

    try {
      const rendered = await this.mediaPipeline.render({
        videoId: video.id,
        title: video.title,
        scriptText,
        voiceId: video.avatar?.voiceId || "ke-neutral-001",
        avatarId: video.avatarId,
        avatarCategory: video.avatar?.category || video.category || "general",
        language: video.language,
        backgroundStyle: this.resolveBackgroundStyle(video.category),
      });

      // ✅ Updated: Persist RenderMetadata on successful render
      const updated = await this.prisma.video.update({
        where: { id: video.id },
        data: {
          status: "MODERATION",
          videoUrl: rendered.videoUrl,
          thumbnailUrl: rendered.thumbnailUrl,
          durationSeconds: rendered.durationSeconds,
          renderMetadata: {
            upsert: {
              create: {
                ttsProvider: env.ttsProvider,
                avatarProvider: env.avatarProvider,
                renderProvider: env.videoRenderProvider,
                audioUrl: rendered.audioUrl,
                avatarVideoUrl: rendered.avatarVideoUrl,
                composedVideoUrl: rendered.videoUrl,
                thumbnailUrl: rendered.thumbnailUrl,
                durationSeconds: rendered.durationSeconds,
                fallbackUsed: false,
                metadata: {
                  pipeline: "media-render.pipeline",
                  safeFailure: false,
                },
              },
              update: {
                ttsProvider: env.ttsProvider,
                avatarProvider: env.avatarProvider,
                renderProvider: env.videoRenderProvider,
                audioUrl: rendered.audioUrl,
                avatarVideoUrl: rendered.avatarVideoUrl,
                composedVideoUrl: rendered.videoUrl,
                thumbnailUrl: rendered.thumbnailUrl,
                durationSeconds: rendered.durationSeconds,
                fallbackUsed: false,
                failureReason: null,
                metadata: {
                  pipeline: "media-render.pipeline",
                  safeFailure: false,
                },
              },
            },
          },
        },
      });

      await publishEvent(
        KafkaTopics.VIDEO_RENDERED,
        {
          videoId: updated.id,
          videoUrl: updated.videoUrl,
          thumbnailUrl: updated.thumbnailUrl,
          durationSeconds: updated.durationSeconds || 45,
        },
        updated.id,
      );

      return {
        video: updated,
        provider: env.videoRenderProvider,
        metadata: {
          audioUrl: rendered.audioUrl,
          avatarVideoUrl: rendered.avatarVideoUrl,
          renderProvider: env.videoRenderProvider,
          ttsProvider: env.ttsProvider,
          avatarProvider: env.avatarProvider,
          fallbackUsed: false,
        },
      };
    } catch (error) {
      return this.handleRenderFailure({
        videoId: video.id,
        error,
      });
    }
  }

  async renderPendingVideos(take = 20) {
    const videos = await this.prisma.video.findMany({
      where: {
        status: "SCRIPTED",
      },
      orderBy: {
        createdAt: "asc",
      },
      take,
    });

    const rendered = [];
    for (const video of videos) {
      rendered.push(
        await this.renderVideo({
          videoId: video.id,
        }),
      );
    }
    return rendered;
  }

  async listVideos(params: {
    status?:
      | "DRAFT"
      | "SCRIPTED"
      | "RENDERING"
      | "MODERATION"
      | "APPROVED"
      | "PUBLISHED"
      | "REJECTED"
      | "FAILED";
    category?: string;
    region?: string;
    country?: string;
    take?: number;
  }) {
    return this.prisma.video.findMany({
      where: {
        status: params.status,
        category: params.category,
        region: params.region,
        country: params.country,
      },
      include: {
        script: true,
        avatar: true,
        creator: true,
        score: true,
        moderationLogs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: params.take || 50,
    });
  }

  async getVideo(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        script: true,
        avatar: true,
        creator: true,
        score: true,
        moderationLogs: true,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video not found: ${id}`);
    }

    return video;
  }

  private async markVideoStatus(videoId: string, status: VideoStatus) {
    return this.prisma.video.update({
      where: { id: videoId },
      data: { status },
    });
  }

  private async handleRenderFailure(input: {
    videoId: string;
    error: unknown;
  }) {
    const message =
      input.error instanceof Error
        ? input.error.message
        : "Unknown render provider failure";

    const shouldUseMockFallback =
      process.env.ALLOW_RENDER_FALLBACK === "true" ||
      env.videoRenderProvider === "mock";

    // ✅ Updated: Persist renderMetadata on failure with no fallback
    if (!shouldUseMockFallback) {
      const failed = await this.prisma.video.update({
        where: { id: input.videoId },
        data: {
          status: "FAILED",
          renderMetadata: {
            upsert: {
              create: {
                renderProvider: env.videoRenderProvider,
                fallbackUsed: false,
                failureReason: message,
                metadata: {
                  safeFailure: true,
                },
              },
              update: {
                renderProvider: env.videoRenderProvider,
                fallbackUsed: false,
                failureReason: message,
                metadata: {
                  safeFailure: true,
                },
              },
            },
          },
        },
      });

      return {
        video: failed,
        provider: env.videoRenderProvider,
        metadata: {
          fallbackUsed: false,
          failureReason: message,
          safeFailure: true,
        },
      };
    }

    // ✅ Updated: Persist renderMetadata on fallback
    const fallbackVideoUrl = `${env.cdnBaseUrl}/videos/${input.videoId}.mp4`;
    const fallbackThumbnailUrl = `${env.cdnBaseUrl}/thumbnails/${input.videoId}.jpg`;

    const fallback = await this.prisma.video.update({
      where: { id: input.videoId },
      data: {
        status: "MODERATION",
        videoUrl: fallbackVideoUrl,
        thumbnailUrl: fallbackThumbnailUrl,
        durationSeconds: 45,
        renderMetadata: {
          upsert: {
            create: {
              ttsProvider: env.ttsProvider,
              avatarProvider: env.avatarProvider,
              renderProvider: "mock_fallback",
              composedVideoUrl: fallbackVideoUrl,
              thumbnailUrl: fallbackThumbnailUrl,
              durationSeconds: 45,
              fallbackUsed: true,
              failureReason: message,
              metadata: {
                originalProvider: env.videoRenderProvider,
                safeFailure: true,
              },
            },
            update: {
              renderProvider: "mock_fallback",
              composedVideoUrl: fallbackVideoUrl,
              thumbnailUrl: fallbackThumbnailUrl,
              durationSeconds: 45,
              fallbackUsed: true,
              failureReason: message,
              metadata: {
                originalProvider: env.videoRenderProvider,
                safeFailure: true,
              },
            },
          },
        },
      },
    });

    await publishEvent(
      KafkaTopics.VIDEO_RENDERED,
      {
        videoId: fallback.id,
        videoUrl: fallback.videoUrl,
        thumbnailUrl: fallback.thumbnailUrl,
        durationSeconds: fallback.durationSeconds || 45,
      },
      fallback.id,
    );

    return {
      video: fallback,
      provider: "mock_fallback",
      metadata: {
        fallbackUsed: true,
        failureReason: message,
        renderProvider: env.videoRenderProvider,
        safeFailure: true,
      },
    };
  }

  private resolveBackgroundStyle(category: string): string {
    const map: Record<string, string> = {
      comedy: "urban Kenyan street, bright, playful",
      career: "modern office and learning environment",
      business: "small business workspace, clean, practical",
      campus: "African campus environment, youthful",
      motivation: "bright YohPal branded inspirational background",
      technology: "futuristic digital interface, clean",
      news: "modern YohPal Live newsroom",
    };

    return (
      map[category.toLowerCase()] || "bright YohPal Live branded background"
    );
  }
}
