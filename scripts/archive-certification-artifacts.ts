import fs from 'fs';
import path from 'path';

const archiveDir = path.join(
  process.cwd(),
  'evidence',
  'archive',
  new Date().toISOString().replace(/[.:]/g, '-')
);

fs.mkdirSync(archiveDir, { recursive: true });
console.log('✅ Archive folder created:', archiveDir);

console.log('\n📦 Archive these artifacts manually or automate in CI:');
console.log('  - V4 Diagnostic Report');
console.log('  - V5 Diagnostic Report');
console.log('  - V6 Diagnostic Report');
console.log('  - Executive Evidence Bundle');
console.log('  - Blueprint Certification');
console.log('  - Runtime Evidence');
console.log('  - GO/NO-GO Decision');
console.log('  - Production Deployment Lock');
console.log('  - Release Version Register');
console.log('  - First Production Deployment Record');
console.log('  - Executive Signatures\n');
