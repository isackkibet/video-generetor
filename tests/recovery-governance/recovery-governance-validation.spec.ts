import {
  createRecoveryRepositorySchema,
  updateRecoveryRepositorySchema,
  upsertRecoveryBatchSchema,
  createRecoveryEvidenceSchema,
  createRecoveryBlockerSchema,
  createRecoveryRiskSchema,
  governanceStatusUpdateSchema,
  certificationDecisionSchema,
  executiveApprovalSchema
} from '../../contracts/validation-schemas';

describe('Recovery Governance Runtime Validation', () => {
  it('accepts valid repository creation input', () => {
    const result = createRecoveryRepositorySchema.safeParse({
      code: 'GW',
      name: 'API Gateway',
      owner: 'Platform Team',
      repositoryPath: 'backend/api-gateway'
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid repository alignment score', () => {
    const result = updateRecoveryRepositorySchema.safeParse({
      alignmentScore: 150
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid batch completion input', () => {
    const result = upsertRecoveryBatchSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      batchNumber: 42,
      title: 'Event-Driven Worker Completion Pack',
      status: 'COMPLETED',
      evidenceIds: ['YL-SCRIPT-LOG-20260701-001']
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid batch number below recovery range', () => {
    const result = upsertRecoveryBatchSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      batchNumber: 10,
      title: 'Invalid batch',
      status: 'COMPLETED'
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid evidence submission', () => {
    const result = createRecoveryEvidenceSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      evidenceCode: 'YL-GW-API-20260701-001',
      category: 'API',
      title: 'Gateway API evidence',
      storageUrl: 'evidence/api/gateway.json'
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid evidence category', () => {
    const result = createRecoveryEvidenceSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      evidenceCode: 'YL-GW-INVALID-20260701-001',
      category: 'INVALID',
      title: 'Invalid evidence'
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid blocker', () => {
    const result = createRecoveryBlockerSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      blockerCode: 'BLK-GW-001',
      title: 'Missing auth',
      description: 'JWT guard missing.',
      severity: 'HIGH'
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid risk', () => {
    const result = createRecoveryRiskSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      riskCode: 'RSK-GW-001',
      title: 'Rate limit risk',
      description: 'Rate limit values may need tuning.',
      severity: 'MEDIUM',
      mitigation: 'Monitor 429 responses.'
    });
    expect(result.success).toBe(true);
  });

  it('accepts governance status update', () => {
    const result = governanceStatusUpdateSchema.safeParse({
      status: 'RESOLVED',
      resolution: 'Secret configured.'
    });
    expect(result.success).toBe(true);
  });

  it('accepts certification approval', () => {
    const result = certificationDecisionSchema.safeParse({
      repositoryId: '00000000-0000-0000-0000-000000000000',
      certificationType: 'SECURITY',
      decision: 'APPROVED',
      reviewer: 'Security Lead'
    });
    expect(result.success).toBe(true);
  });

  it('accepts executive approval', () => {
    const result = executiveApprovalSchema.safeParse({
      releaseVersion: 'v1.0.0-rc1',
      decision: 'APPROVED',
      approver: 'Executive Sponsor'
    });
    expect(result.success).toBe(true);
  });
});
