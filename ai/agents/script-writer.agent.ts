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
};
export class ScriptWriterAgent {
  private readonly provider = createLlmProvider();
  async write(input: ScriptWriterInput): Promise<ScriptWriterOutput> {
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
    };
  }
}
