import {
  ModerateContentInput,
  ModerateContentOutput,
  ModerationProvider,
} from "../interfaces/moderation-provider.interface";

export class MockModerationProvider implements ModerationProvider {
  async moderate(input: ModerateContentInput): Promise<ModerateContentOutput> {
    const text = `${input.title} ${input.text}`.toLowerCase();

    const blockedTerms = [
      "guaranteed profit",
      "cure disease",
      "vote for",
      "hate speech",
      "tribe is better",
      "free money guaranteed",
      "medical advice",
      "legal advice",
    ].filter((term) => text.includes(term));

    if (blockedTerms.length > 0) {
      return {
        action: "BLOCK",
        score: 0.25,
        reason: `Blocked terms detected: ${blockedTerms.join(", ")}`,
        metadata: { blockedTerms },
      };
    }

    const sensitiveCategories = [
      "politics",
      "health",
      "finance",
      "religion",
      "ethnicity",
      "crime",
      "children",
      "breaking_news",
      "legal",
      "medical",
    ];

    if (sensitiveCategories.includes(input.category.toLowerCase())) {
      return {
        action: "REVIEW",
        score: 0.72,
        reason: "Sensitive category requires human review",
        metadata: { sensitiveCategory: true },
      };
    }

    return {
      action: "ALLOW",
      score: 0.91,
      reason: "Passed mock moderation",
      metadata: { provider: "mock" },
    };
  }
}
