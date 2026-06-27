import {
  GenerateTtsInput,
  GenerateTtsOutput,
  TtsProvider,
} from "../interfaces/tts-provider.interface";

export class MockTtsProvider implements TtsProvider {
  async generateSpeech(input: GenerateTtsInput): Promise<GenerateTtsOutput> {
    return {
      audioUrl: `mock://tts/${encodeURIComponent(input.voiceId)}.mp3`,
      durationSeconds: Math.max(
        15,
        Math.min(90, Math.ceil(input.text.length / 12)),
      ),
    };
  }
}
