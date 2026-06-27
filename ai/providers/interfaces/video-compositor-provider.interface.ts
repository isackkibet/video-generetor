export type ComposeVideoInput = {
  videoId: string;
  title: string;
  avatarVideoUrl: string;
  audioUrl: string;
  subtitleText: string;
  backgroundStyle?: string;
  durationSeconds: number;
};

export type ComposeVideoOutput = {
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

export interface VideoCompositorProvider {
  composeVideo(input: ComposeVideoInput): Promise<ComposeVideoOutput>;
}
