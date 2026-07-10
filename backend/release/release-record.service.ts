import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class ReleaseRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async createReleaseRecord(input: {
    version: string;
    type: 'GA' | 'HOTFIX' | 'PATCH';
    evidenceBundleId: string;
    deploymentLockId: string;
    blueprintAlignment: number;
    approvedBy: string;
  }) {
    return {
      generatedAt: new Date().toISOString(),
      release: input,
      status: 'READY_FOR_GENERAL_AVAILABILITY',
    };
  }

  async getCurrentRelease() {
    return {
      currentVersion: 'v1.0.0',
      status: 'READY_FOR_GENERAL_AVAILABILITY',
    };
  }
}
