import fs from 'fs';
import path from 'path';
import { PrismaService } from '../backend/shared/prisma.service';
import { BlueprintCertificationService } from '../backend/shared/blueprint-certification.service';
import { V4ClosureCertificationService } from '../backend/diagnostics/v4-closure-certification.service';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const blueprintService = new BlueprintCertificationService(prisma);
  const service = new V4ClosureCertificationService(prisma, blueprintService);

  const report = await service.generateClosureReport();

  const outDir = path.join(process.cwd(), 'evidence', 'diagnostic-v4');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'v4-closure-certification-report.json'),
    JSON.stringify(report, null, 2),
  );

  await prisma.$disconnect();

  console.log('✅ Generated evidence/diagnostic-v4/v4-closure-certification-report.json');
  console.log(`📊 New Alignment: ${report.summary.newAlignment}% (was 74%)`);
  console.log(`📈 Delta: +${report.summary.alignmentDelta}%`);
  console.log(`📋 Closure Status: ${report.summary.closureStatus}`);
  console.log('');
  console.log('📝 Chapter Closure Summary:');
  report.chapterClosures.forEach((c: any) => {
    const status = c.closed ? '✅ CLOSED' : '❌ PENDING';
    const evidence = typeof c.evidence === 'number' ? c.evidence : JSON.stringify(c.evidence);
    console.log(`  ${status} - ${c.chapter} (${c.baseline}) - Evidence: ${evidence}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
