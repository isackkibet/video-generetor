import fs from 'fs';
import path from 'path';
import { PrismaService } from '../backend/shared/prisma.service';
import { SeedPipelineRunner } from '../backend/runtime-evidence/seed-pipeline-runner';
import { AuditLogGenerator } from '../backend/runtime-evidence/audit-log-generator';
import { FeedLearningSimulator } from '../backend/runtime-evidence/feed-learning-simulator';
import { ModerationEvidenceRunner } from '../backend/runtime-evidence/moderation-evidence-runner';
import { ProductionReadinessEvidence } from '../backend/runtime-evidence/production-readiness-evidence';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const seed = await new SeedPipelineRunner(prisma).runSeedPipelineEvidence(25);
  const audit = await new AuditLogGenerator(prisma).generateAuditEvidence();
  const moderation = await new ModerationEvidenceRunner(prisma).generateModerationEvidence();
  const learning = await new FeedLearningSimulator(prisma).simulateFeedLearning();
  const report = await new ProductionReadinessEvidence(prisma).generateReport();

  const outDir = path.join(process.cwd(), 'evidence', 'runtime');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'runtime-evidence-report.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        seed,
        audit,
        moderation,
        learning,
        report,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
  console.log('✅ Runtime evidence report generated: evidence/runtime/runtime-evidence-report.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
