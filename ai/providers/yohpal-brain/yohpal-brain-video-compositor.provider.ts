import {
  ComposeVideoInput,
  ComposeVideoOutput,
  VideoCompositorProvider,
} from "../interfaces/video-compositor-provider.interface";
import { YohPalBrainClient } from "./yohpal-brain.client";

export class YohPalBrainVideoCompositorProvider implements VideoCompositorProvider {
  private readonly client = new YohPalBrainClient();

  async composeVideo(input: ComposeVideoInput): Promise<ComposeVideoOutput> {
    return this.client.post<ComposeVideoOutput>("/v1/media/compose-short", {
      videoId: input.videoId,
      title: input.title,
      avatarVideoUrl: input.avatarVideoUrl,
      audioUrl: input.audioUrl,
      subtitleText: input.subtitleText,
      backgroundStyle: input.backgroundStyle,
      durationSeconds: input.durationSeconds,
      format: "vertical_9_16",
    });
  }
}
