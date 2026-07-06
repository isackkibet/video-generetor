import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class RecoveryGovernanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== Seed Default Repositories ==========
  async seedDefaultRepositories() {
    const repos = [
      ['GW', 'API Gateway', 'Platform Team', 'backend/api-gateway'],
      ['TREND', 'Trend Service', 'Content Intelligence Team', 'backend/trend-service'],
      ['SCRIPT', 'Script Service', 'AI Content Team', 'backend/script-service'],
      ['RENDER', 'Render Service', 'Media Pipeline Team', 'backend/render-service'],
      ['MOD', 'Moderation Service', 'Trust & Safety Team', 'backend/moderation-service'],
      ['FEED', 'Recommendation Service', 'Feed Intelligence Team', 'backend/recommendation-service'],
      ['ADMIN', 'Admin Web', 'Admin Platform Team', 'apps/admin_web'],
      ['MOBILE', 'Mobile Flutter', 'Mobile Team', 'apps/mobile_flutter'],
      ['DEVOPS', 'DevOps & Infrastructure', 'DevOps Team', 'infra'],
    ];

    for (const [code, name, owner, repositoryPath] of repos) {
      await this.prisma.recoveryRepository.upsert({
        where: { code },
        update: { name, owner, repositoryPath },
        create: { code, name, owner, repositoryPath },
      });
    }

    return this.listRepositories();
  }

  // ========== Repositories ==========
  async listRepositories() {
    return this.prisma.recoveryRepository.findMany({
      include: {
        batches: true,
        evidence: true,
        blockers: true,
        risks: true,
        certifications: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRepository(id: string) {
    const repo = await this.prisma.recoveryRepository.findUnique({
      where: { id },
      include: {
        batches: true,
        evidence: true,
        blockers: true,
        risks: true,
        certifications: true,
      },
    });
    if (!repo) throw new NotFoundException(`Repository not found: ${id}`);
    return repo;
  }

  async createRepository(data: any) {
    return this.prisma.recoveryRepository.create({ data });
  }

  async updateRepository(id: string, data: any) {
    return this.prisma.recoveryRepository.update({
      where: { id },
      data: {
        ...data,
        certifiedAt: data.status === 'CERTIFIED' ? new Date() : undefined,
      },
    });
  }

  // ========== Batches ==========
  async upsertBatch(data: any) {
    return this.prisma.recoveryBatchCompletion.upsert({
      where: {
        repositoryId_batchNumber: {
          repositoryId: data.repositoryId,
          batchNumber: data.batchNumber,
        },
      },
      update: {
        title: data.title,
        status: data.status,
        evidenceIds: data.evidenceIds || [],
        notes: data.notes,
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
      },
      create: {
        repositoryId: data.repositoryId,
        batchNumber: data.batchNumber,
        title: data.title,
        status: data.status,
        evidenceIds: data.evidenceIds || [],
        notes: data.notes,
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  // ========== Evidence ==========
  async createEvidence(data: any) {
    return this.prisma.recoveryEvidence.create({ data });
  }

  async acceptEvidence(id: string, reviewer?: string) {
    return this.prisma.recoveryEvidence.update({
      where: { id },
      data: {
        accepted: true,
        reviewedBy: reviewer,
        reviewedAt: new Date(),
      },
    });
  }

  // ========== Blockers ==========
  async createBlocker(data: any) {
    return this.prisma.recoveryBlocker.create({ data });
  }

  async updateBlocker(id: string, data: any) {
    return this.prisma.recoveryBlocker.update({
      where: { id },
      data: {
        status: data.status,
        resolution: data.resolution,
        resolvedAt: data.status === 'RESOLVED' ? new Date() : undefined,
      },
    });
  }

  // ========== Risks ==========
  async createRisk(data: any) {
    return this.prisma.recoveryRisk.create({ data });
  }

  async updateRisk(id: string, data: any) {
    return this.prisma.recoveryRisk.update({
      where: { id },
      data: {
        status: data.status,
        mitigation: data.resolution,
        acceptedAt: data.status === 'ACCEPTED' ? new Date() : undefined,
      },
    });
  }

  // ========== Certifications ==========
  async certifyRepository(data: any) {
    const cert = await this.prisma.recoveryCertification.create({
      data: {
        repositoryId: data.repositoryId,
        certificationType: data.certificationType,
        decision: data.decision,
        reviewer: data.reviewer,
        comments: data.comments,
        decidedAt: data.decision !== 'PENDING' ? new Date() : null,
      },
    });

    if (data.decision === 'APPROVED') {
      const repoCerts = await this.prisma.recoveryCertification.count({
        where: {
          repositoryId: data.repositoryId,
          decision: 'APPROVED',
        },
      });
      if (repoCerts >= 1) {
        await this.prisma.recoveryRepository.update({
          where: { id: data.repositoryId },
          data: { status: 'CERTIFIED', certifiedAt: new Date() },
        });
      }
    }
    return cert;
  }

  // ========== Executive Approvals ==========
  async executiveApproval(data: any) {
    return this.prisma.executiveRecoveryApproval.create({
      data: {
        releaseVersion: data.releaseVersion,
        decision: data.decision,
        approver: data.approver,
        comments: data.comments,
        decidedAt: data.decision !== 'PENDING' ? new Date() : null,
      },
    });
  }

  // ========== Dashboard ==========
  async dashboard() {
    const repositories = await this.listRepositories();
    const total = repositories.length || 1;
    const certified = repositories.filter((r) => r.status === 'CERTIFIED').length;
    const avgAlignment = Math.round(
      repositories.reduce((sum, r) => sum + r.alignmentScore, 0) / total
    );
    const blockers = repositories.flatMap((r) => r.blockers);
    const risks = repositories.flatMap((r) => r.risks);
    const evidence = repositories.flatMap((r) => r.evidence);

    const highOpenBlockers = blockers.filter(
      (b) =>
        ['CRITICAL', 'HIGH'].includes(b.severity) &&
        !['RESOLVED', 'ACCEPTED'].includes(b.status)
    ).length;

    const evidenceSubmitted = evidence.length;
    const evidenceAccepted = evidence.filter((e) => e.accepted).length;

    const readinessScore = Math.round(
      avgAlignment * 0.4 +
      (certified / total) * 100 * 0.3 +
      (evidenceSubmitted > 0 ? (evidenceAccepted / evidenceSubmitted) * 100 : 0) * 0.2 +
      (highOpenBlockers === 0 ? 100 : 0) * 0.1
    );

    const decision =
      avgAlignment >= 90 && certified === total && highOpenBlockers === 0
        ? 'GO'
        : 'NO-GO';

    return {
      generatedAt: new Date().toISOString(),
      repositories,
      summary: {
        repositoriesTotal: total,
        repositoriesCertified: certified,
        avgAlignment,
        blockersTotal: blockers.length,
        highOpenBlockers,
        risksTotal: risks.length,
        evidenceSubmitted,
        evidenceAccepted,
        executiveReadinessScore: readinessScore,
        decision,
      },
    };
  }
}
