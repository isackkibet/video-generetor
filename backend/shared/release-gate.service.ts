import { Injectable } from '@nestjs/common';
import { BlueprintCertificationService } from './blueprint-certification.service';

@Injectable()
export class ReleaseGateService {
  constructor(
    private readonly blueprintCertificationService: BlueprintCertificationService,
  ) {}

  async evaluate() {
    const report = await this.blueprintCertificationService.generateReport();
    const blockers = report.blockers || [];
    const alignment = report.estimatedAlignmentPercent || 0;

    const go =
      alignment >= 90 &&
      blockers.length === 0 &&
      report.productionDecision === 'ELIGIBLE_FOR_PRODUCTION_CERTIFICATION';

    return {
      generatedAt: new Date().toISOString(),
      decision: go ? 'GO' : 'NO-GO',
      minimumAlignmentRequired: 90,
      actualAlignment: alignment,
      blockerCount: blockers.length,
      productionDecision: report.productionDecision,
      blockers,
      report,
    };
  }
}
