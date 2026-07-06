import fs from 'fs';
import path from 'path';
import { PrismaService } from '../backend/shared/prisma.service';
import { BlueprintCertificationService } from '../backend/shared/blueprint-certification.service';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const service = new BlueprintCertificationService(prisma);
  const report = await service.generateReport();

  const outDir = path.join(process.cwd(), 'evidence');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, 'blueprint-alignment-report.json');
  const mdPath = path.join(outDir, 'blueprint-alignment-report.md');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const markdown = [
    '# YohPal Live Blueprint Alignment Certification Report',
    '',
    `**Generated At:** ${report.generatedAt}`,
    `**Blueprint:** ${report.blueprint}`,
    `**Estimated Alignment:** ${report.estimatedAlignmentPercent}%`,
    `**Production Decision:** ${report.productionDecision}`,
    '',
    '## Areas',
    '',
    ...report.areas.map(
      (area) =>
        `- **${area.area}**: ${area.status} (${area.score}%) – ${area.blockers.length ? 'Blockers: ' + area.blockers.join('; ') : '✅ No blockers'}`
    ),
    '',
    '## Required Next Actions',
    '',
    ...(report.blockers.length ? report.blockers.map((b) => `- ${b.area}: ${b.blocker}`) : ['✅ No blockers – system is production-ready.']),
  ].join('\n');

  fs.writeFileSync(mdPath, markdown);

  await prisma.$disconnect();
  console.log(`Blueprint certification report written to ${jsonPath}`);
  console.log(`Blueprint certification markdown written to ${mdPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
