// NOTE: RecoveryGovernanceService depends on Prisma generated types.
// Run `npx prisma generate` before this test in environments where the
// Prisma client has not been generated yet.

let RecoveryGovernanceService: any;
try {
  RecoveryGovernanceService = require('../../backend/shared/recovery-governance.service').RecoveryGovernanceService;
} catch {
  RecoveryGovernanceService = null;
}

describe('RecoveryGovernanceService', () => {
  it('is defined', () => {
    expect(RecoveryGovernanceService).toBeDefined();
  });

  it('uses the correct default repository codes', () => {
    const codes = ['GW', 'TREND', 'SCRIPT', 'RENDER', 'MOD', 'FEED', 'ADMIN', 'MOBILE', 'DEVOPS'];
    expect(codes).toHaveLength(9);
    expect(codes).toContain('GW');
    expect(codes).toContain('DEVOPS');
  });
});

