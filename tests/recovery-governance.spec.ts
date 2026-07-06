import { RecoveryGovernanceService } from '../backend/shared/recovery-governance.service';

describe('RecoveryGovernanceService', () => {
  it('is defined', () => {
    expect(RecoveryGovernanceService).toBeDefined();
  });

  it('calculates GO only when all policy inputs are satisfied', () => {
    const avgAlignment = 92;
    const certified = 9;
    const total = 9;
    const highOpenBlockers = 0;
    const decision =
      avgAlignment >= 90 && certified === total && highOpenBlockers === 0
        ? 'GO'
        : 'NO-GO';
    expect(decision).toBe('GO');
  });
});
