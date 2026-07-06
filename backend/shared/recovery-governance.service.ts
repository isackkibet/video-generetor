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

  // ========== Exports ==========
  private toCsv(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (value: unknown) => {
      if (value === null || value === undefined) return '';
      const text = String(value).replace(/"/g, '""');
      return `"${text}"`;
    };
    return [
      headers.join(','),
      ...rows.map(row => headers.map(header => escape(row[header])).join(','))
    ].join('\n');
  }

  async exportRepositories(format: 'json' | 'csv' = 'json') {
    const repositories = await this.prisma.recoveryRepository.findMany({
      orderBy: { name: 'asc' }
    });
    const rows = repositories.map((repo: any) => ({
      id: repo.id,
      code: repo.code,
      name: repo.name,
      owner: repo.owner,
      repositoryPath: repo.repositoryPath,
      status: repo.status,
      alignmentScore: repo.alignmentScore,
      evidenceSubmitted: repo.evidenceSubmitted,
      certifiedAt: repo.certifiedAt?.toISOString() || '',
      updatedAt: repo.updatedAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportBatches(format: 'json' | 'csv' = 'json') {
    const batches = await this.prisma.recoveryBatchCompletion.findMany({
      include: { repository: true },
      orderBy: [{ batchNumber: 'asc' }, { updatedAt: 'desc' }]
    });
    const rows = batches.map((batch: any) => ({
      repositoryCode: batch.repository.code,
      repositoryName: batch.repository.name,
      batchNumber: batch.batchNumber,
      title: batch.title,
      status: batch.status,
      evidenceIds: batch.evidenceIds.join(';'),
      completedAt: batch.completedAt?.toISOString() || '',
      notes: batch.notes || '',
      updatedAt: batch.updatedAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportEvidence(format: 'json' | 'csv' = 'json') {
    const evidence = await this.prisma.recoveryEvidence.findMany({
      include: { repository: true },
      orderBy: { createdAt: 'desc' }
    });
    const rows = evidence.map((item: any) => ({
      evidenceCode: item.evidenceCode,
      repositoryCode: item.repository.code,
      repositoryName: item.repository.name,
      category: item.category,
      title: item.title,
      description: item.description || '',
      storageUrl: item.storageUrl || '',
      submittedBy: item.submittedBy || '',
      accepted: item.accepted,
      reviewedBy: item.reviewedBy || '',
      reviewedAt: item.reviewedAt?.toISOString() || '',
      createdAt: item.createdAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportBlockers(format: 'json' | 'csv' = 'json') {
    const blockers = await this.prisma.recoveryBlocker.findMany({
      include: { repository: true },
      orderBy: [{ severity: 'asc' }, { updatedAt: 'desc' }]
    });
    const rows = blockers.map((item: any) => ({
      blockerCode: item.blockerCode,
      repositoryCode: item.repository.code,
      repositoryName: item.repository.name,
      title: item.title,
      description: item.description,
      severity: item.severity,
      status: item.status,
      owner: item.owner || '',
      resolution: item.resolution || '',
      resolvedAt: item.resolvedAt?.toISOString() || '',
      updatedAt: item.updatedAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportRisks(format: 'json' | 'csv' = 'json') {
    const risks = await this.prisma.recoveryRisk.findMany({
      include: { repository: true },
      orderBy: [{ severity: 'asc' }, { updatedAt: 'desc' }]
    });
    const rows = risks.map((item: any) => ({
      riskCode: item.riskCode,
      repositoryCode: item.repository.code,
      repositoryName: item.repository.name,
      title: item.title,
      description: item.description,
      severity: item.severity,
      status: item.status,
      mitigation: item.mitigation || '',
      owner: item.owner || '',
      acceptedBy: item.acceptedBy || '',
      acceptedAt: item.acceptedAt?.toISOString() || '',
      updatedAt: item.updatedAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportCertifications(format: 'json' | 'csv' = 'json') {
    const certifications = await this.prisma.recoveryCertification.findMany({
      include: { repository: true },
      orderBy: { updatedAt: 'desc' }
    });
    const rows = certifications.map((item: any) => ({
      repositoryCode: item.repository.code,
      repositoryName: item.repository.name,
      certificationType: item.certificationType,
      decision: item.decision,
      reviewer: item.reviewer || '',
      comments: item.comments || '',
      decidedAt: item.decidedAt?.toISOString() || '',
      updatedAt: item.updatedAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportExecutiveApprovals(format: 'json' | 'csv' = 'json') {
    const approvals = await this.prisma.executiveRecoveryApproval.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    const rows = approvals.map((item: any) => ({
      releaseVersion: item.releaseVersion,
      decision: item.decision,
      approver: item.approver || '',
      comments: item.comments || '',
      decidedAt: item.decidedAt?.toISOString() || '',
      updatedAt: item.updatedAt.toISOString()
    }));
    return format === 'csv' ? this.toCsv(rows) : rows;
  }

  async exportGoNoGoSummary(format: 'json' | 'csv' = 'json') {
    const dashboard = await this.dashboard();
    const row = {
      generatedAt: dashboard.generatedAt,
      repositoriesTotal: dashboard.summary.repositoriesTotal,
      repositoriesCertified: dashboard.summary.repositoriesCertified,
      avgAlignment: dashboard.summary.avgAlignment,
      blockersTotal: dashboard.summary.blockersTotal,
      highOpenBlockers: dashboard.summary.highOpenBlockers,
      risksTotal: dashboard.summary.risksTotal,
      evidenceSubmitted: dashboard.summary.evidenceSubmitted,
      evidenceAccepted: dashboard.summary.evidenceAccepted,
      executiveReadinessScore: dashboard.summary.executiveReadinessScore,
      decision: dashboard.summary.decision
    };
    return format === 'csv' ? this.toCsv([row]) : row;
  }

  async exportCompleteBundle() {
    const [
      dashboard,
      repositories,
      batches,
      evidence,
      blockers,
      risks,
      certifications,
      executiveApprovals,
      goNoGoSummary
    ] = await Promise.all([
      this.dashboard(),
      this.exportRepositories('json'),
      this.exportBatches('json'),
      this.exportEvidence('json'),
      this.exportBlockers('json'),
      this.exportRisks('json'),
      this.exportCertifications('json'),
      this.exportExecutiveApprovals('json'),
      this.exportGoNoGoSummary('json')
    ]);
    return {
      generatedAt: new Date().toISOString(),
      title: 'YohPal Live Recovery Governance Evidence Bundle',
      dashboard,
      repositories,
      batches,
      evidence,
      blockers,
      risks,
      certifications,
      executiveApprovals,
      goNoGoSummary
    };
  }
}
