export type GenerateTtsInput = {
  text: string;
  voiceId: string;
  language: string;
};

export type GenerateTtsOutput = {
  audioUrl: string;
  durationSeconds: number;
};

export interface TtsProvider {
  generateSpeech(input: GenerateTtsInput): Promise<GenerateTtsOutput>;
}
