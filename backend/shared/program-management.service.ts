import { Injectable } from '@nestjs/common';
import { RepositoryRecoveryStatus, ExecutiveReadiness } from '../../contracts/program-management';

@Injectable()
export class ProgramManagementService {
  async getDashboard() {
    // Placeholder data – will be replaced by Batch 54's database-backed version
    const repositories: RepositoryRecoveryStatus[] = [
      {
        repository: 'API Gateway',
        owner: 'Platform Team',
        batchesCompleted: 8,
        totalBatches: 11,
        progressPercent: 73,
        alignmentScore: 85,
        certificationStatus: 'IN_PROGRESS',
        blockers: 1,
        risks: 0,
        evidenceSubmitted: false,
      },
      {
        repository: 'Trend Service',
        owner: 'Content Intelligence Team',
        batchesCompleted: 11,
        totalBatches: 11,
        progressPercent: 100,
        alignmentScore: 92,
        certificationStatus: 'READY_FOR_REVIEW',
        blockers: 0,
        risks: 0,
        evidenceSubmitted: true,
      },
      {
        repository: 'Script Service',
        owner: 'AI Content Team',
        batchesCompleted: 10,
        totalBatches: 11,
        progressPercent: 91,
        alignmentScore: 88,
        certificationStatus: 'IN_PROGRESS',
        blockers: 0,
        risks: 1,
        evidenceSubmitted: false,
      },
      {
        repository: 'Render Service',
        owner: 'Media Pipeline Team',
        batchesCompleted: 9,
        totalBatches: 11,
        progressPercent: 82,
        alignmentScore: 80,
        certificationStatus: 'IN_PROGRESS',
        blockers: 2,
        risks: 1,
        evidenceSubmitted: false,
      },
      {
        repository: 'Moderation Service',
        owner: 'Trust & Safety Team',
        batchesCompleted: 9,
        totalBatches: 11,
        progressPercent: 82,
        alignmentScore: 82,
        certificationStatus: 'IN_PROGRESS',
        blockers: 2,
        risks: 0,
        evidenceSubmitted: false,
      },
      {
        repository: 'Recommendation Service',
        owner: 'Feed Intelligence Team',
        batchesCompleted: 8,
        totalBatches: 11,
        progressPercent: 73,
        alignmentScore: 75,
        certificationStatus: 'IN_PROGRESS',
        blockers: 2,
        risks: 1,
        evidenceSubmitted: false,
      },
      {
        repository: 'Admin Web',
        owner: 'Admin Platform Team',
        batchesCompleted: 10,
        totalBatches: 11,
        progressPercent: 91,
        alignmentScore: 90,
        certificationStatus: 'READY_FOR_REVIEW',
        blockers: 0,
        risks: 0,
        evidenceSubmitted: true,
      },
      {
        repository: 'Mobile Flutter',
        owner: 'Mobile Team',
        batchesCompleted: 6,
        totalBatches: 11,
        progressPercent: 55,
        alignmentScore: 65,
        certificationStatus: 'IN_PROGRESS',
        blockers: 3,
        risks: 1,
        evidenceSubmitted: false,
      },
      {
        repository: 'DevOps & Infrastructure',
        owner: 'DevOps Team',
        batchesCompleted: 11,
        totalBatches: 11,
        progressPercent: 100,
        alignmentScore: 95,
        certificationStatus: 'CERTIFIED',
        blockers: 0,
        risks: 0,
        evidenceSubmitted: true,
      },
    ];

    const certified = repositories.filter(r => r.certificationStatus === 'CERTIFIED').length;
    const total = repositories.length;
    const avgAlignment = Math.round(
      repositories.reduce((sum, r) => sum + r.alignmentScore, 0) / total
    );
    const totalBlockers = repositories.reduce((sum, r) => sum + r.blockers, 0);
    const totalRisks = repositories.reduce((sum, r) => sum + r.risks, 0);
    const evidenceSubmitted = repositories.filter(r => r.evidenceSubmitted).length;

    const readinessScore = Math.round(
      avgAlignment * 0.4 +
      (certified / total) * 100 * 0.3 +
      (evidenceSubmitted / total) * 100 * 0.2 +
      (totalBlockers === 0 ? 100 : 0) * 0.1
    );

    const executiveReadiness: ExecutiveReadiness = {
      blueprintAlignment: avgAlignment,
      repositoriesCertified: certified,
      repositoriesTotal: total,
      executiveReadinessScore: readinessScore,
      decision: avgAlignment >= 90 && certified === total && totalBlockers === 0 ? 'GO' : 'NO-GO',
    };

    return {
      generatedAt: new Date().toISOString(),
      repositories,
      executiveReadiness,
      summary: {
        totalRepositories: total,
        certified,
        avgAlignment,
        totalBlockers,
        totalRisks,
        evidenceSubmitted,
        readinessScore,
        decision: executiveReadiness.decision,
      },
    };
  }
}
