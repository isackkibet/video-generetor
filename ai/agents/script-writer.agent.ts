import { ContentStrategyOutput } from "./content-strategy.agent";
import { createLlmProvider } from "../providers/provider-factory";
export type ScriptWriterInput = {
  topic: string;
  category: string;
  region?: string | null;
  country?: string | null;
  language?: string;
  strategy: ContentStrategyOutput;
};
export type ScriptWriterOutput = {
  title: string;
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  language: string;
  durationHint: number;
  qualityScore: number;
  providerName: string;
  fallbackUsed: boolean;
};
export class ScriptWriterAgent {
  private readonly provider = createLlmProvider();
  async write(input: ScriptWriterInput): Promise<ScriptWriterOutput> {
    const providerName = process.env.LLM_PROVIDER || "mock";
    try {
      const script = await this.provider.generateScript({
        topic: input.topic,
        category: input.category,
        region: input.region,
        country: input.country,
        language: input.language || "en",
        durationSeconds: input.strategy.durationSeconds,
        tone: input.strategy.tone,
        audience: input.strategy.targetAudience,
      });
      return {
        title: script.title,
        hook: script.hook,
        body: script.body,
        cta: script.cta,
        fullScript: script.fullScript,
        language: input.language || "en",
        durationHint: input.strategy.durationSeconds,
        qualityScore: script.qualityScore,
        providerName,
        fallbackUsed: false,
      };
    } catch (error) {
      const allowFallback =
        process.env.ALLOW_LLM_FALLBACK === "true" || providerName === "mock";
      if (!allowFallback) {
        throw error;
      }
      const fallback = this.localFallbackScript(input);
      return {
        ...fallback,
        providerName: "local_fallback",
        fallbackUsed: true,
      };
    }
  }
  private localFallbackScript(input: ScriptWriterInput): ScriptWriterOutput {
    const hook =
      input.category.toLowerCase() === "career"
        ? "This one skill could change your future."
        : input.category.toLowerCase() === "business"
          ? "Before you start your next hustle, listen to this."
          : `Here is something worth knowing about ${input.topic}.`;
    const body = `${input.topic} matters because YohPal Live users need content that is useful, entertaining,
safe, and easy to understand. Keep learning, keep building, and use YohPal to discover more opportunities.`;
    const cta = "Follow YohPal Live for more smart videos.";
    return {
      title: input.topic,
      hook,
      body,
      cta,
      fullScript: `${hook}\n\n${body}\n\n${cta}`,
      language: input.language || "en",
      durationHint: input.strategy.durationSeconds,
      qualityScore: 0.76,
      providerName: "local_fallback",
      fallbackUsed: true,
    };
  }
}
