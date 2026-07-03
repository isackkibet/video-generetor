import {
  createAvatarProvider,
  createTtsProvider,
  createVideoCompositorProvider,
} from "../../../ai/providers/provider-factory";
import { PrismaService } from "../../shared/prisma.service";
import { ProviderJobLogger } from "../../shared/provider-job-logger";
import { env } from "../../shared/env";
import { runProviderStage } from "./provider-stage-runner";

export type MediaRenderPipelineInput = {
  videoId: string;
  title: string;
  scriptText: string;
  voiceId: string;
  avatarId?: string | null;
  avatarCategory: string;
  language: string;
  backgroundStyle?: string;
};

export type MediaRenderPipelineOutput = {
  audioUrl: string;
  avatarVideoUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

export class MediaRenderPipeline {
  private readonly ttsProvider = createTtsProvider();
  private readonly avatarProvider = createAvatarProvider();
  private readonly compositorProvider = createVideoCompositorProvider();
  private readonly logger: ProviderJobLogger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new ProviderJobLogger(prisma);
  }

  async render(
    input: MediaRenderPipelineInput,
  ): Promise<MediaRenderPipelineOutput> {
    const allowFallback =
      process.env.ALLOW_RENDER_FALLBACK === "true" ||
      env.videoRenderProvider === "mock";

    const tts = await runProviderStage({
      logger: this.logger,
      videoId: input.videoId,
      jobType: "TTS",
      providerName: env.ttsProvider,
      serviceName: "render-service",
      stage: "tts",
      allowFallback,
      requestPayload: {
        voiceId: input.voiceId,
        language: input.language,
        textLength: input.scriptText.length,
      },
      execute: () =>
        this.ttsProvider.generateSpeech({
          text: input.scriptText,
          voiceId: input.voiceId,
          language: input.language,
        }),
      fallback: async () => ({
        audioUrl: `mock://tts/${input.videoId}.mp3`,
        durationSeconds: Math.max(
          15,
          Math.min(90, Math.ceil(input.scriptText.length / 12)),
        ),
      }),
    });

    const avatar = await runProviderStage({
      logger: this.logger,
      videoId: input.videoId,
      jobType: "AVATAR_VIDEO",
      providerName: env.avatarProvider,
      serviceName: "render-service",
      stage: "avatar",
      allowFallback,
      requestPayload: {
        avatarId: input.avatarId,
        avatarCategory: input.avatarCategory,
        language: input.language,
      },
      execute: () =>
        this.avatarProvider.generateAvatarVideo({
          avatarId: input.avatarId,
          avatarCategory: input.avatarCategory,
          scriptText: input.scriptText,
          audioUrl: tts.audioUrl,
          language: input.language,
          emotion: "engaging",
        }),
      fallback: async () => ({
        avatarVideoUrl: `mock://avatar/${input.videoId}.mp4`,
        durationSeconds: tts.durationSeconds,
      }),
    });

    const durationSeconds = Math.max(
      tts.durationSeconds,
      avatar.durationSeconds,
    );

    const composed = await runProviderStage({
      logger: this.logger,
      videoId: input.videoId,
      jobType: "VIDEO_COMPOSITE",
      providerName: env.videoRenderProvider,
      serviceName: "render-service",
      stage: "composition",
      allowFallback,
      requestPayload: {
        title: input.title,
        durationSeconds,
        backgroundStyle: input.backgroundStyle,
      },
      execute: () =>
        this.compositorProvider.composeVideo({
          videoId: input.videoId,
          title: input.title,
          avatarVideoUrl: avatar.avatarVideoUrl,
          audioUrl: tts.audioUrl,
          subtitleText: input.scriptText,
          backgroundStyle: input.backgroundStyle,
          durationSeconds,
        }),
      fallback: async () => ({
        videoUrl: `${env.cdnBaseUrl}/videos/${input.videoId}.mp4`,
        thumbnailUrl: `${env.cdnBaseUrl}/thumbnails/${input.videoId}.jpg`,
        durationSeconds,
      }),
    });

    return {
      audioUrl: tts.audioUrl,
      avatarVideoUrl: avatar.avatarVideoUrl,
      videoUrl: composed.videoUrl,
      thumbnailUrl: composed.thumbnailUrl,
      durationSeconds: composed.durationSeconds,
    };
  }
}
