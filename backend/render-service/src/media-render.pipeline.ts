import {
  createAvatarProvider,
  createTtsProvider,
  createVideoCompositorProvider,
} from "../../../ai/providers/provider-factory";
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
  async render(
    input: MediaRenderPipelineInput,
  ): Promise<MediaRenderPipelineOutput> {
    const tts = await this.ttsProvider.generateSpeech({
      text: input.scriptText,
      voiceId: input.voiceId,
      language: input.language,
    });
    const avatar = await this.avatarProvider.generateAvatarVideo({
      avatarId: input.avatarId,
      avatarCategory: input.avatarCategory,
      scriptText: input.scriptText,
      audioUrl: tts.audioUrl,
      language: input.language,
      emotion: "engaging",
    });
    const durationSeconds = Math.max(
      tts.durationSeconds,
      avatar.durationSeconds,
    );
    const composed = await this.compositorProvider.composeVideo({
      videoId: input.videoId,
      title: input.title,
      avatarVideoUrl: avatar.avatarVideoUrl,
      audioUrl: tts.audioUrl,
      subtitleText: input.scriptText,
      backgroundStyle: input.backgroundStyle,
      durationSeconds,
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
