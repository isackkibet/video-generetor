import {
  GenerateScriptProviderInput,
  GenerateScriptProviderOutput,
  LlmScriptProvider,
} from "../interfaces/llm-script-provider.interface";

export class MockLlmProvider implements LlmScriptProvider {
  async generateScript(
    input: GenerateScriptProviderInput,
  ): Promise<GenerateScriptProviderOutput> {
    const hook =
      input.category === "business"
        ? "Before you start your next hustle, listen to this."
        : input.category === "career"
          ? "This one skill could change your future."
          : `Here is something worth knowing about ${input.topic}.`;

    const body = `${input.topic} matters because YohPal Live users need useful, entertaining and practical content. Keep it simple, make it relatable, and end with something viewers can act on today.`;

    const cta = "Follow YohPal Live for more smart videos.";

    return {
      title: input.topic,
      hook,
      body,
      cta,
      fullScript: `${hook}\n\n${body}\n\n${cta}`,
      qualityScore: 0.82,
    };
  }
}
