import fs from 'fs';
import path from 'path';
import { PrismaService } from '../backend/shared/prisma.service';
import { LaunchReadinessService } from '../backend/launch-validation/launch-readiness.service';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const report = await new LaunchReadinessService(prisma).evaluate();

  const outDir = path.join(process.cwd(), 'evidence', 'launch');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'final-launch-readiness-report.json'),
    JSON.stringify(report, null, 2),
  );

  console.log(JSON.stringify(report, null, 2));

  await prisma.$disconnect();

  if (report.launchReadinessDecision === 'NOT_READY') {
    process.exit(1);
  }
}

main();
