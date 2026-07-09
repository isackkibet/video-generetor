import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class EventProcessingValidator {
  constructor(private readonly prisma: PrismaService) {}

  async validate() {
    const [total, success, failed, deadLettered] = await Promise.all([
      this.prisma.eventProcessingLog.count(),
      this.prisma.eventProcessingLog.count({ where: { status: 'SUCCESS' } }),
      this.prisma.eventProcessingLog.count({ where: { status: 'FAILED' } }),
      this.prisma.eventProcessingLog.count({ where: { status: 'DEAD_LETTERED' } }),
    ]);

    return {
      total,
      success,
      failed,
      deadLettered,
      passed: total > 0 && success > 0 && failed === 0 && deadLettered === 0,
      blocker:
        total === 0
          ? 'No EventProcessingLog evidence. Enable workers and run async pipeline.'
          : failed > 0 || deadLettered > 0
            ? 'Failed or dead-lettered events remain.'
            : null,
    };
  }
}
