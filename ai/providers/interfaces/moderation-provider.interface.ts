export type ModerateContentInput = {
  title: string;
  text: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  language: string;
};

export type ModerateContentOutput = {
  action: "ALLOW" | "LIMIT" | "REVIEW" | "BLOCK";
  score: number;
  reason: string;
  metadata: Record<string, unknown>;
};

export interface ModerationProvider {
  moderate(input: ModerateContentInput): Promise<ModerateContentOutput>;
}
