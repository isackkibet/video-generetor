import { Injectable } from '@nestjs/common';
import { RecoveryGovernanceService } from './recovery-governance.service';
import { BlueprintCertificationService } from './blueprint-certification.service';
import { ReleaseGateService } from './release-gate.service';
import { BackupEvidenceService } from './backup-evidence.service';

@Injectable()
export class ExecutiveEvidenceService {
  constructor(
    private readonly recoveryGovernanceService: RecoveryGovernanceService,
    private readonly blueprintCertificationService: BlueprintCertificationService,
    private readonly releaseGateService: ReleaseGateService,
    private readonly backupEvidenceService: BackupEvidenceService
  ) {}

  async generateBundle() {
    const [
      recoveryBundle,
      blueprintReport,
      releaseGate,
      backupEvidence
    ] = await Promise.all([
      this.recoveryGovernanceService.exportCompleteBundle(),
      this.blueprintCertificationService.generateReport(),
      this.releaseGateService.evaluate(),
      this.backupEvidenceService.getBackupEvidence()
    ]);

    return {
      generatedAt: new Date().toISOString(),
      title: 'YohPal Live Executive Evidence Bundle',
      productionRule: {
        minimumBlueprintAlignment: 90,
        requiredDecision: 'GO',
        blockersRequired: 0,
        executiveApprovalRequired: true
      },
      recoveryGovernance: recoveryBundle,
      blueprintCertification: blueprintReport,
      releaseGate,
      backupEvidence
    };
  }
}
