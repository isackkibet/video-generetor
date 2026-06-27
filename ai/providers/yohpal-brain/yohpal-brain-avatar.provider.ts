import {
  AvatarProvider,
  GenerateAvatarInput,
  GenerateAvatarOutput,
} from "../interfaces/avatar-provider.interface";
import { YohPalBrainClient } from "./yohpal-brain.client";

export class YohPalBrainAvatarProvider implements AvatarProvider {
  private readonly client = new YohPalBrainClient();

  async generateAvatarVideo(
    input: GenerateAvatarInput,
  ): Promise<GenerateAvatarOutput> {
    return this.client.post<GenerateAvatarOutput>("/v1/media/avatar-video", {
      avatarId: input.avatarId,
      avatarCategory: input.avatarCategory,
      scriptText: input.scriptText,
      audioUrl: input.audioUrl,
      language: input.language,
      emotion: input.emotion || "engaging",
    });
  }
}
