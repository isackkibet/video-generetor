describe('Release gate policy', () => {
  function evaluate(input: {
    alignment: number;
    blockers: number;
    productionDecision: string;
  }) {
    return input.alignment >= 90 &&
      input.blockers === 0 &&
      input.productionDecision === 'ELIGIBLE_FOR_PRODUCTION_CERTIFICATION'
      ? 'GO'
      : 'NO-GO';
  }

  it('returns GO only when alignment is at least 90 and blockers are zero', () => {
    expect(
      evaluate({
        alignment: 92,
        blockers: 0,
        productionDecision: 'ELIGIBLE_FOR_PRODUCTION_CERTIFICATION',
      })
    ).toBe('GO');
  });

  it('returns NO-GO when alignment is below 90', () => {
    expect(
      evaluate({
        alignment: 89,
        blockers: 0,
        productionDecision: 'ELIGIBLE_FOR_PRODUCTION_CERTIFICATION',
      })
    ).toBe('NO-GO');
  });

  it('returns NO-GO when blockers remain', () => {
    expect(
      evaluate({
        alignment: 95,
        blockers: 1,
        productionDecision: 'ELIGIBLE_FOR_PRODUCTION_CERTIFICATION',
      })
    ).toBe('NO-GO');
  });
});
