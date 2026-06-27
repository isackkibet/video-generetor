export type GenerateAvatarInput = {
  avatarId?: string | null;
  avatarCategory: string;
  scriptText: string;
  audioUrl: string;
  language: string;
  emotion?: string;
};

export type GenerateAvatarOutput = {
  avatarVideoUrl: string;
  durationSeconds: number;
};

export interface AvatarProvider {
  generateAvatarVideo(
    input: GenerateAvatarInput,
  ): Promise<GenerateAvatarOutput>;
}
