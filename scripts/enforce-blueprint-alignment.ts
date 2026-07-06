import fs from 'fs';
import path from 'path';

type BlueprintReport = {
  estimatedAlignmentPercent: number;
  productionDecision: string;
  blockers: {
    area: string;
    blocker: string;
  }[];
};

const reportPath = process.env.BLUEPRINT_REPORT_PATH ||
  path.join(process.cwd(), 'evidence', 'blueprint-alignment-report.json');

const minimumAlignment = Number(process.env.MIN_BLUEPRINT_ALIGNMENT || 90);

function main() {
  if (!fs.existsSync(reportPath)) {
    console.error(`Blueprint report not found: ${reportPath}`);
    process.exit(1);
  }

  const report = JSON.parse(
    fs.readFileSync(reportPath, 'utf8')
  ) as BlueprintReport;

  const alignment = report.estimatedAlignmentPercent || 0;
  const blockers = report.blockers || [];

  console.log(`Blueprint alignment: ${alignment}%`);
  console.log(`Minimum required alignment: ${minimumAlignment}%`);
  console.log(`Blockers: ${blockers.length}`);

  if (alignment < minimumAlignment) {
    console.error(
      `NO-GO: Blueprint alignment is ${alignment}%, below required ${minimumAlignment}%.`
    );
    process.exit(1);
  }

  if (blockers.length > 0) {
    console.error('NO-GO: Blueprint blockers remain:');
    for (const blocker of blockers) {
      console.error(`  - ${blocker.area}: ${blocker.blocker}`);
    }
    process.exit(1);
  }

  if (report.productionDecision !== 'ELIGIBLE_FOR_PRODUCTION_CERTIFICATION') {
    console.error(
      `NO-GO: Production decision is ${report.productionDecision}.`
    );
    process.exit(1);
  }

  console.log('GO: Blueprint alignment gate passed.');
}

main();
