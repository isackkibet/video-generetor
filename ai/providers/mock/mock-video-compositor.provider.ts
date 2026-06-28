import {
  ComposeVideoInput,
  ComposeVideoOutput,
  VideoCompositorProvider,
} from "../interfaces/video-compositor-provider.interface";
import { env } from "../../../backend/shared/env";

export class MockVideoCompositorProvider implements VideoCompositorProvider {
  async composeVideo(input: ComposeVideoInput): Promise<ComposeVideoOutput> {
    return {
      videoUrl: `${env.cdnBaseUrl}/videos/${input.videoId}.mp4`,
      thumbnailUrl: `${env.cdnBaseUrl}/thumbnails/${input.videoId}.jpg`,
      durationSeconds: input.durationSeconds,
    };
  }
}
