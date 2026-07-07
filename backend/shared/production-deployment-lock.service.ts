import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProductionDeploymentLockService {
  constructor(private readonly prisma: PrismaService) {}

  async createLock(input: {
    releaseVersion: string;
    evidenceBundleId: string;
    executiveDecision: 'GO' | 'NO_GO';
    authorizationSigned: boolean;
    authorizedBy?: string;
    authorizationReference?: string;
    notes?: string;
  }) {
    const isAuthorized =
      input.executiveDecision === 'GO' &&
      input.authorizationSigned === true &&
      Boolean(input.evidenceBundleId);

    return this.prisma.productionDeploymentLock.upsert({
      where: { releaseVersion: input.releaseVersion },
      update: {
        evidenceBundleId: input.evidenceBundleId,
        executiveDecision: input.executiveDecision,
        authorizationSigned: input.authorizationSigned,
        authorizedBy: input.authorizedBy,
        authorizationReference: input.authorizationReference,
        notes: input.notes,
        deploymentStatus: isAuthorized ? 'AUTHORIZED' : 'BLOCKED',
        authorizedAt: isAuthorized ? new Date() : null,
      },
      create: {
        releaseVersion: input.releaseVersion,
        evidenceBundleId: input.evidenceBundleId,
        executiveDecision: input.executiveDecision,
        authorizationSigned: input.authorizationSigned,
        authorizedBy: input.authorizedBy,
        authorizationReference: input.authorizationReference,
        notes: input.notes,
        deploymentStatus: isAuthorized ? 'AUTHORIZED' : 'BLOCKED',
        authorizedAt: isAuthorized ? new Date() : null,
      },
    });
  }

  async getLock(releaseVersion: string) {
    const lock = await this.prisma.productionDeploymentLock.findUnique({
      where: { releaseVersion },
    });
    if (!lock) {
      throw new NotFoundException(`No deployment lock found for release ${releaseVersion}`);
    }
    return lock;
  }

  async validateReleaseCanDeploy(releaseVersion: string) {
    const lock = await this.getLock(releaseVersion);
    const allowed =
      lock.executiveDecision === 'GO' &&
      lock.authorizationSigned === true &&
      lock.deploymentStatus === 'AUTHORIZED' &&
      Boolean(lock.evidenceBundleId);

    if (!allowed) {
      throw new BadRequestException({
        decision: 'NO-GO',
        reason: 'Production deployment is locked.',
        releaseVersion,
        requirements: {
          executiveDecision: 'GO',
          authorizationSigned: true,
          deploymentStatus: 'AUTHORIZED',
          evidenceBundleIdRequired: true,
        },
        actual: {
          executiveDecision: lock.executiveDecision,
          authorizationSigned: lock.authorizationSigned,
          deploymentStatus: lock.deploymentStatus,
          evidenceBundleId: lock.evidenceBundleId,
        },
      });
    }

    return {
      decision: 'GO',
      releaseVersion,
      evidenceBundleId: lock.evidenceBundleId,
      authorizedBy: lock.authorizedBy,
      authorizationReference: lock.authorizationReference,
      authorizedAt: lock.authorizedAt,
    };
  }

  async markDeployed(input: { releaseVersion: string; deploymentEvidenceRef?: string }) {
    await this.validateReleaseCanDeploy(input.releaseVersion);
    return this.prisma.productionDeploymentLock.update({
      where: { releaseVersion: input.releaseVersion },
      data: {
        deploymentStatus: 'DEPLOYED',
        deployedAt: new Date(),
        notes: input.deploymentEvidenceRef
          ? `Deployment evidence: ${input.deploymentEvidenceRef}`
          : undefined,
      },
    });
  }

  async revoke(releaseVersion: string) {
    return this.prisma.productionDeploymentLock.update({
      where: { releaseVersion },
      data: { deploymentStatus: 'REVOKED', revokedAt: new Date() },
    });
  }

  async listLocks() {
    return this.prisma.productionDeploymentLock.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }
}
