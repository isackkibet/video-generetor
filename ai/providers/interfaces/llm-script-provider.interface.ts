export type GenerateScriptProviderInput = {
  topic: string;
  category: string;
  region?: string | null;
  country?: string | null;
  language: string;
  durationSeconds: number;
  tone: string;
  audience: string;
};
export type GenerateScriptProviderOutput = {
  title: string;
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  qualityScore: number;
};
export interface LlmScriptProvider {
  generateScript(
    input: GenerateScriptProviderInput,
  ): Promise<GenerateScriptProviderOutput>;
}
