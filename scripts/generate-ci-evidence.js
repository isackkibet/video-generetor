const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'evidence');
fs.mkdirSync(outDir, { recursive: true });

const evidence = {
  generatedAt: new Date().toISOString(),
  source: 'npm run ci:evidence',
  checks: {
    typecheck: 'REQUIRED',
    unitTests: 'REQUIRED',
    e2eTests: 'REQUIRED',
    prismaGenerate: 'REQUIRED',
    prismaValidate: 'REQUIRED'
  },
  status: 'PENDING_CI_OUTPUT_ATTACHMENT'
};

fs.writeFileSync(
  path.join(outDir, 'ci-evidence.json'),
  JSON.stringify(evidence, null, 2)
);
console.log('CI evidence template generated at evidence/ci-evidence.json');
