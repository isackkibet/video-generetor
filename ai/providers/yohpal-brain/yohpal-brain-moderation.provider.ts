import {
  ModerateContentInput,
  ModerateContentOutput,
  ModerationProvider,
} from "../interfaces/moderation-provider.interface";
import { YohPalBrainClient } from "./yohpal-brain.client";

export class YohPalBrainModerationProvider implements ModerationProvider {
  private readonly client = new YohPalBrainClient();

  async moderate(input: ModerateContentInput): Promise<ModerateContentOutput> {
    return this.client.post<ModerateContentOutput>(
      "/v1/safety/moderate-live-content",
      {
        title: input.title,
        text: input.text,
        videoUrl: input.videoUrl,
        thumbnailUrl: input.thumbnailUrl,
        category: input.category,
        language: input.language,
        safetyMode: "strict",
      },
    );
  }
}
