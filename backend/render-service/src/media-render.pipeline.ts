import {
  createAvatarProvider,
  createTtsProvider,
  createVideoCompositorProvider,
} from "../../../ai/providers/provider-factory";
import { PrismaService } from "../../shared/prisma.service";
import { ProviderJobLogger } from "../../shared/provider-job-logger";
import { env } from "../../shared/env";
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
    const ttsJob = await this.logger.start({
      videoId: input.videoId,
      jobType: "TTS",
      providerName: env.ttsProvider,
      requestPayload: {
        voiceId: input.voiceId,
        language: input.language,
        textLength: input.scriptText.length,
      },
    });
    const tts = await this.ttsProvider.generateSpeech({
      text: input.scriptText,
      voiceId: input.voiceId,
      language: input.language,
    });
    await this.logger.success({
      jobId: ttsJob.id,
      responsePayload: {
        audioUrl: tts.audioUrl,
        durationSeconds: tts.durationSeconds,
      },
    });
    const avatarJob = await this.logger.start({
      videoId: input.videoId,
      jobType: "AVATAR_VIDEO",
      providerName: env.avatarProvider,
      requestPayload: {
        avatarId: input.avatarId,
        avatarCategory: input.avatarCategory,
        language: input.language,
      },
    });
    const avatar = await this.avatarProvider.generateAvatarVideo({
      avatarId: input.avatarId,
      avatarCategory: input.avatarCategory,
      scriptText: input.scriptText,
      audioUrl: tts.audioUrl,
      language: input.language,
      emotion: "engaging",
    });
    await this.logger.success({
      jobId: avatarJob.id,
      responsePayload: {
        avatarVideoUrl: avatar.avatarVideoUrl,
        durationSeconds: avatar.durationSeconds,
      },
    });
    const durationSeconds = Math.max(
      tts.durationSeconds,
      avatar.durationSeconds,
    );
    const compositeJob = await this.logger.start({
      videoId: input.videoId,
      jobType: "VIDEO_COMPOSITE",
      providerName: env.videoRenderProvider,
      requestPayload: {
        title: input.title,
        durationSeconds,
        backgroundStyle: input.backgroundStyle,
      },
    });
    const composed = await this.compositorProvider.composeVideo({
      videoId: input.videoId,
      title: input.title,
      avatarVideoUrl: avatar.avatarVideoUrl,
      audioUrl: tts.audioUrl,
      subtitleText: input.scriptText,
      backgroundStyle: input.backgroundStyle,
      durationSeconds,
    });
    await this.logger.success({
      jobId: compositeJob.id,
      responsePayload: {
        videoUrl: composed.videoUrl,
        thumbnailUrl: composed.thumbnailUrl,
        durationSeconds: composed.durationSeconds,
      },
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
