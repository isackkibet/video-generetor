import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { AdminJwtGuard } from '../shared/admin-jwt.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';
import { SeedPipelineRunner } from './seed-pipeline-runner';
import { AuditLogGenerator } from './audit-log-generator';
import { FeedLearningSimulator } from './feed-learning-simulator';
import { ModerationEvidenceRunner } from './moderation-evidence-runner';
import { ProductionReadinessEvidence } from './production-readiness-evidence';

@Controller('runtime-evidence')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class RuntimeEvidenceController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('generate')
  async generateAll() {
    const seed = await new SeedPipelineRunner(this.prisma).runSeedPipelineEvidence(25);
    const audit = await new AuditLogGenerator(this.prisma).generateAuditEvidence();
    const moderation = await new ModerationEvidenceRunner(
      this.prisma,
    ).generateModerationEvidence();
    const learning = await new FeedLearningSimulator(this.prisma).simulateFeedLearning();
    const report = await new ProductionReadinessEvidence(this.prisma).generateReport();

    return {
      success: true,
      data: {
        seed,
        audit,
        moderation,
        learning,
        report,
      },
    };
  }

  @Get('report')
  async report() {
    return {
      success: true,
      data: await new ProductionReadinessEvidence(this.prisma).generateReport(),
    };
  }
}
