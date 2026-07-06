describe('Recovery Governance Dashboard Score Logic', () => {
  function calculateReadinessScore(input: {
    avgAlignment: number;
    certified: number;
    total: number;
    evidenceSubmitted: number;
    evidenceAccepted: number;
    highOpenBlockers: number;
  }) {
    return Math.round(
      input.avgAlignment * 0.4 +
      (input.certified / input.total) * 100 * 0.3 +
      (input.evidenceSubmitted > 0
        ? (input.evidenceAccepted / input.evidenceSubmitted) * 100
        : 0) * 0.2 +
      (input.highOpenBlockers === 0 ? 100 : 0) * 0.1
    );
  }

  function decision(input: {
    avgAlignment: number;
    certified: number;
    total: number;
    highOpenBlockers: number;
  }) {
    return input.avgAlignment >= 90 &&
      input.certified === input.total &&
      input.highOpenBlockers === 0
      ? 'GO'
      : 'NO-GO';
  }

  it('calculates high readiness when all inputs are strong', () => {
    const score = calculateReadinessScore({
      avgAlignment: 95,
      certified: 9,
      total: 9,
      evidenceSubmitted: 20,
      evidenceAccepted: 20,
      highOpenBlockers: 0
    });
    expect(score).toBeGreaterThanOrEqual(95);
  });

  it('returns GO only when all repositories are certified and no high blockers remain', () => {
    expect(
      decision({
        avgAlignment: 92,
        certified: 9,
        total: 9,
        highOpenBlockers: 0
      })
    ).toBe('GO');
  });

  it('returns NO-GO when alignment is below 90', () => {
    expect(
      decision({
        avgAlignment: 89,
        certified: 9,
        total: 9,
        highOpenBlockers: 0
      })
    ).toBe('NO-GO');
  });

  it('returns NO-GO when not all repositories are certified', () => {
    expect(
      decision({
        avgAlignment: 95,
        certified: 8,
        total: 9,
        highOpenBlockers: 0
      })
    ).toBe('NO-GO');
  });

  it('returns NO-GO when high blockers remain', () => {
    expect(
      decision({
        avgAlignment: 95,
        certified: 9,
        total: 9,
        highOpenBlockers: 1
      })
    ).toBe('NO-GO');
  });
});
