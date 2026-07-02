import { calculateRankScore } from '../backend/shared/rank-score';

describe('calculateRankScore', () => {
  it('returns a score between 0 and 1', () => {
    const score = calculateRankScore({
      engagementScore: 0.9,
      interestScore: 0.8,
      localityScore: 1,
      freshnessScore: 0.7,
      qualityScore: 0.85,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
