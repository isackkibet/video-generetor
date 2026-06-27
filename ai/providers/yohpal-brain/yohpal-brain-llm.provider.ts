import {
  GenerateScriptProviderInput,
  GenerateScriptProviderOutput,
  LlmScriptProvider,
} from "../interfaces/llm-script-provider.interface";
import { YohPalBrainClient } from "./yohpal-brain.client";

export class YohPalBrainLlmProvider implements LlmScriptProvider {
  private readonly client = new YohPalBrainClient();

  async generateScript(
    input: GenerateScriptProviderInput,
  ): Promise<GenerateScriptProviderOutput> {
    return this.client.post<GenerateScriptProviderOutput>(
      "/v1/live/scripts/generate",
      {
        topic: input.topic,
        category: input.category,
        region: input.region,
        country: input.country,
        language: input.language,
        durationSeconds: input.durationSeconds,
        tone: input.tone,
        audience: input.audience,
        safetyMode: "strict",
      },
    );
  }
}
