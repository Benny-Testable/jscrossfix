#!/usr/bin/env node
'use strict';
/**
 * PyDriller corpus harness (JavaScript) — primary tool, Code Churn block.
 * Delegates to git-history-analyzer.js (git CLI). No Python in repo.
 * Exit codes match tool_integration.js: 0 ran, 3 skipped, 4 missing, 1 failed.
 */
const fs = require('fs');
const path = require('path');
const {
  analyzeGitHistory,
  pydrillerCompatiblePayload,
  DEFAULT_MAX_COMMITS,
} = require('./git-history-analyzer');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const REPORT_JSON = path.join(REPORTS_DIR, 'pydriller.json');
const REPORT_ANALYSIS = path.join(REPORTS_DIR, 'git-history-analysis.json');

function main() {
  if (!fs.existsSync(path.join(ROOT, '.git'))) {
    console.log('STATUS: NOT INSTALLED');
    console.log('  tool  : pydriller');
    console.log(`  reason: ${ROOT} is not a git repository`);
    process.exit(4);
  }

  const maxCommits = parseInt(process.env.PYDRILLER_MAX_COMMITS || String(DEFAULT_MAX_COMMITS), 10);
  const windowDays = process.env.PYDRILLER_WINDOW_DAYS
    ? parseInt(process.env.PYDRILLER_WINDOW_DAYS, 10)
    : 365;

  const analysis = analyzeGitHistory({
    root: ROOT,
    maxCommits: Number.isFinite(maxCommits) ? maxCommits : DEFAULT_MAX_COMMITS,
    revision: 'HEAD',
    windowDays,
    jsOnly: true,
    includeCommitDetails: true,
  });

  if (!analysis.ok) {
    console.log('STATUS: FAILED');
    console.log('  tool  : pydriller');
    console.log('  error :', (analysis.error || 'git history analysis failed').slice(0, 500));
    if (analysis.shallow) {
      console.log('  note  : shallow clone — fetch more history if git reports missing objects');
    }
    process.exit(1);
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const payload = pydrillerCompatiblePayload(analysis);
  fs.writeFileSync(REPORT_JSON, JSON.stringify(payload, null, 2));
  fs.writeFileSync(REPORT_ANALYSIS, JSON.stringify(analysis, null, 2));

  console.log('STATUS: RAN');
  console.log('  tool    : pydriller');
  console.log(`  commits : ${analysis.summary.commits}`);
  console.log(`  files   : ${analysis.summary.files_touched}`);
  console.log(`  shallow : ${analysis.shallow}`);
  if (analysis.shallow) {
    console.log('  note    : repository is shallow; analysis limited to fetched commits');
  }
  process.exit(0);
}

main();