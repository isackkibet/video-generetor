import {
  GenerateTtsInput,
  GenerateTtsOutput,
  TtsProvider,
} from "../interfaces/tts-provider.interface";
import { YohPalBrainClient } from "./yohpal-brain.client";

export class YohPalBrainTtsProvider implements TtsProvider {
  private readonly client = new YohPalBrainClient();

  async generateSpeech(input: GenerateTtsInput): Promise<GenerateTtsOutput> {
    return this.client.post<GenerateTtsOutput>("/v1/media/tts", {
      text: input.text,
      voiceId: input.voiceId,
      language: input.language,
    });
  }
}
