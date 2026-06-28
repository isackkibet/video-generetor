import {
  AvatarProvider,
  GenerateAvatarInput,
  GenerateAvatarOutput,
} from "../interfaces/avatar-provider.interface";

export class MockAvatarProvider implements AvatarProvider {
  async generateAvatarVideo(
    input: GenerateAvatarInput,
  ): Promise<GenerateAvatarOutput> {
    return {
      avatarVideoUrl: `mock://avatar-video/${input.avatarCategory}/${Date.now()}.mp4`,
      durationSeconds: Math.max(
        15,
        Math.min(90, Math.ceil(input.scriptText.length / 12)),
      ),
    };
  }
}
