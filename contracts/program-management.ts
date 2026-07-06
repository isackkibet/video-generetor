export type RepositoryRecoveryStatus = {
  repository: string;
  owner: string;
  batchesCompleted: number;
  totalBatches: number;
  progressPercent: number;
  alignmentScore: number;
  certificationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'CERTIFIED';
  blockers: number;
  risks: number;
  evidenceSubmitted: boolean;
};

export type ExecutiveReadiness = {
  blueprintAlignment: number;
  repositoriesCertified: number;
  repositoriesTotal: number;
  executiveReadinessScore: number;
  decision: 'GO' | 'NO-GO';
};
