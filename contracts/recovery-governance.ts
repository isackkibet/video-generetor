export type RecoveryRepositoryInput = {
  code: string;
  name: string;
  owner: string;
  repositoryPath: string;
};

export type RecoveryEvidenceInput = {
  repositoryId: string;
  evidenceCode: string;
  category: string;
  title: string;
  description?: string;
  storageUrl?: string;
  submittedBy?: string;
};

export type RecoveryBlockerInput = {
  repositoryId: string;
  blockerCode: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  owner?: string;
};

export type RecoveryRiskInput = {
  repositoryId: string;
  riskCode: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation?: string;
  owner?: string;
};
