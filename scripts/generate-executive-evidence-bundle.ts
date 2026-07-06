#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

type BundleManifestItem = {
  name: string;
  sourcePath: string;
  copiedTo?: string;
  status: 'INCLUDED' | 'MISSING';
};

function timestamp() {
  return new Date().toISOString().replace(/[.:]/g, '-');
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(input: {
  name: string;
  sourcePath: string;
  targetDir: string;
}): BundleManifestItem {
  const item: BundleManifestItem = {
    name: input.name,
    sourcePath: input.sourcePath,
    status: 'MISSING'
  };

  if (!fs.existsSync(input.sourcePath)) {
    return item;
  }

  const fileName = path.basename(input.sourcePath);
  const targetPath = path.join(input.targetDir, fileName);
  fs.copyFileSync(input.sourcePath, targetPath);
  item.status = 'INCLUDED';
  item.copiedTo = targetPath;
  return item;
}

function writeJson(filePath: string, value: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function main() {
  const generatedAt = new Date().toISOString();
  const bundleId = `executive-evidence-${timestamp()}`;
  const root = process.cwd();

  const bundleRoot = path.join(root, 'evidence', 'executive', bundleId);

  const folders = {
    root: bundleRoot,
    certification: path.join(bundleRoot, 'certification'),
    recovery: path.join(bundleRoot, 'recovery-governance'),
    ci: path.join(bundleRoot, 'ci'),
    screenshots: path.join(bundleRoot, 'screenshots'),
    signoffs: path.join(bundleRoot, 'signoffs'),
    goNoGo: path.join(bundleRoot, 'go-no-go'),
    docs: path.join(bundleRoot, 'docs')
  };

  Object.values(folders).forEach(ensureDir);

  const manifest: BundleManifestItem[] = [];

  const filesToCopy = [
    {
      name: 'Blueprint Alignment JSON',
      sourcePath: path.join(root, 'evidence', 'blueprint-alignment-report.json'),
      targetDir: folders.certification
    },
    {
      name: 'Blueprint Alignment Markdown',
      sourcePath: path.join(root, 'evidence', 'blueprint-alignment-report.md'),
      targetDir: folders.certification
    },
    {
      name: 'CI Evidence JSON',
      sourcePath: path.join(root, 'evidence', 'ci-evidence.json'),
      targetDir: folders.ci
    },
    {
      name: 'GO NO-GO Decision JSON',
      sourcePath: path.join(root, 'evidence', 'go-no-go-decision.json'),
      targetDir: folders.goNoGo
    },
    {
      name: 'Developer Recovery Handover Pack',
      sourcePath: path.join(root, 'docs', 'recovery', 'FINAL_DEVELOPER_RECOVERY_HANDOVER_PACK.md'),
      targetDir: folders.docs
    },
    {
      name: 'Repository Recovery Tracker',
      sourcePath: path.join(root, 'docs', 'recovery', 'REPOSITORY_RECOVERY_EXECUTION_TRACKER.md'),
      targetDir: folders.docs
    },
    {
      name: 'Developer Recovery Assignment Memo',
      sourcePath: path.join(root, 'docs', 'recovery', 'DEVELOPER_RECOVERY_ASSIGNMENT_MEMO.md'),
      targetDir: folders.docs
    },
    {
      name: 'Evidence Naming Standard',
      sourcePath: path.join(root, 'docs', 'recovery', 'EVIDENCE_NAMING_STANDARD.md'),
      targetDir: folders.docs
    },
    {
      name: 'Recovery Submission Structure',
      sourcePath: path.join(root, 'docs', 'recovery', 'RECOVERY_SUBMISSION_STRUCTURE.md'),
      targetDir: folders.docs
    }
  ];

  for (const file of filesToCopy) {
    manifest.push(copyIfExists(file));
  }

  const screenshotsIndex = {
    generatedAt,
    requiredScreenshots: [
      'Program Management Dashboard',
      'Recovery Data',
      'Recovery Evidence',
      'Recovery Blockers',
      'Recovery Risks',
      'Recovery Certification',
      'Executive Approval',
      'Blueprint Certification',
      'Release Gate',
      'Metrics Evidence',
      'Backup Evidence',
      'Event Processing Dashboard'
    ],
    storageFolder: 'screenshots/',
    instruction: 'Place screenshots in the screenshots folder using evidence naming standard.'
  };
  writeJson(path.join(folders.screenshots, 'screenshots-index.json'), screenshotsIndex);

  const signoffIndex = {
    generatedAt,
    requiredSignoffs: [
      'API Gateway Repository Lead',
      'Trend Service Repository Lead',
      'Script Service Repository Lead',
      'Render Service Repository Lead',
      'Moderation Service Repository Lead',
      'Recommendation Service Repository Lead',
      'Admin Web Repository Lead',
      'Mobile Flutter Repository Lead',
      'DevOps Lead',
      'Engineering Lead',
      'Security Lead',
      'Operations Lead',
      'Executive Sponsor'
    ],
    storageFolder: 'signoffs',
    instruction: 'Place signed sign-off documents in the signoffs folder before executive review.'
  };
  writeJson(path.join(folders.signoffs, 'signoff-index.json'), signoffIndex);

  const bundleSummary = {
    bundleId,
    generatedAt,
    title: 'YohPal Live AI Content Factory Executive Evidence Bundle',
    purpose:
      'Consolidated recovery, certification, GO/NO-GO, CI, sign-off, and evidence package for executive production approval.',
    minimumProductionRequirements: {
      blueprintAlignment: '>= 90%',
      blockers: '0 HIGH or CRITICAL unresolved blockers',
      repositories: 'All repositories certified',
      evidence: 'All required evidence submitted and accepted',
      executiveApproval: 'Required'
    },
    folders,
    manifest
  };
  writeJson(path.join(bundleRoot, 'bundle-summary.json'), bundleSummary);

  const readme = `# YohPal Live Executive Evidence Bundle

Bundle ID: ${bundleId}

Generated At: ${generatedAt}

## Purpose

This folder contains the evidence required for executive production review.

## Production Rule

Production must remain blocked unless:
- Blueprint alignment is at least 90%.
- No HIGH or CRITICAL blockers remain.
- All repositories are certified.
- Evidence is submitted and accepted.
- GO/NO-GO gate returns GO.
- Executive approval is signed.

## Contents

- certification/
- recovery-governance/
- ci/
- go-no-go/
- screenshots/
- signoffs/
- docs/
- bundle-summary.json

## Missing Items

Review bundle-summary.json for files marked MISSING.
`;
  fs.writeFileSync(path.join(bundleRoot, 'README.md'), readme);
  console.log(`✅ Executive evidence bundle created: ${bundleRoot}`);
  console.log(`📋 Bundle summary: ${path.join(bundleRoot, 'bundle-summary.json')}`);
}

main();
