#!/usr/bin/env node
'use strict';
/**
 * Node.js git history analyzer (PyDriller-equivalent for corpus harness).
 * Uses git(1) only — no Python runtime.
 */
const { spawnSync } = require('child_process');

const DEFAULT_MAX_COMMITS = 265;
const JS_EXT = new Set(['.js', '.mjs', '.cjs', '.jsx']);

function runGit(cwd, args, maxBuffer = 64 * 1024 * 1024) {
  const result = spawnSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    maxBuffer,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trimEnd(),
    stderr: (result.stderr || '').trimEnd(),
  };
}

function parseIntSafe(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isShallowRepository(gitRoot) {
  const r = runGit(gitRoot, ['rev-parse', '--is-shallow-repository']);
  return r.ok && r.stdout === 'true';
}

function resolveGitRoot(startDir) {
  const r = runGit(startDir, ['rev-parse', '--show-toplevel']);
  if (!r.ok || !r.stdout) return null;
  return r.stdout;
}

function currentBranch(gitRoot) {
  const r = runGit(gitRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
  return r.ok ? r.stdout : 'HEAD';
}

function historyCommitCount(gitRoot, revision = 'HEAD') {
  const r = runGit(gitRoot, ['rev-list', '--count', revision]);
  if (!r.ok) return null;
  return parseIntSafe(r.stdout, null);
}

function parseNumstatLine(line) {
  const m = line.match(/^(\d+|-)\s+(\d+|-)\s+(.+)$/);
  if (!m) return null;
  const insertions = m[1] === '-' ? 0 : parseIntSafe(m[1], 0);
  const deletions = m[2] === '-' ? 0 : parseIntSafe(m[2], 0);
  return { path: normalizePath(m[3]), insertions, deletions };
}

/**
 * @param {object} options
 * @param {string} options.root - repository root (must contain .git)
 * @param {number} [options.maxCommits]
 * @param {string} [options.revision] - branch or ref to analyze (default HEAD)
 * @param {number|null} [options.windowDays] - if set, pass --since to git log
 * @param {boolean} [options.jsOnly] - count churn only on JS extensions
 * @param {boolean} [options.includeCommitDetails] - full per-commit records
 */
function analyzeGitHistory(options) {
  const {
    root,
    maxCommits = DEFAULT_MAX_COMMITS,
    revision = 'HEAD',
    windowDays = null,
    jsOnly = false,
    includeCommitDetails = true,
  } = options;

  const gitRoot = resolveGitRoot(root) || root;
  const shallow = isShallowRepository(gitRoot);
  const branch = currentBranch(gitRoot);
  const historyTotal = historyCommitCount(gitRoot, revision);

  const logArgs = [
    'log',
    revision,
    '-n',
    String(maxCommits),
    '--numstat',
    '--pretty=format:@@@%n%H%x1f%P%x1f%an%x1f%ae%x1f%aI%x1f%B',
  ];
  if (windowDays != null && windowDays > 0) {
    const since = new Date(Date.now() - windowDays * 86400000).toISOString();
    logArgs.push(`--since=${since}`);
  }
  logArgs.push('--');

  const log = runGit(gitRoot, logArgs);
  if (!log.ok) {
    return {
      ok: false,
      error: log.stderr || log.stdout || `git log exited ${log.status}`,
      gitRoot,
      branch,
      revision,
      shallow,
      historyTotal,
      maxCommits,
      windowDays,
      commits: [],
      churnByFile: {},
      summary: { commits: 0, author_count: 0, files_touched: 0 },
    };
  }

  const churnByFile = {};
  const fileStats = {};
  const authors = new Set();
  const commits = [];

  const blocks = log.stdout.split('@@@\n').filter(Boolean);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    const header = lines[0];
    if (!header) continue;

    const parts = header.split('\x1f');
    if (parts.length < 6) continue;

    const [hash, parentsRaw, authorName, authorEmail, authoredAt] = parts;
    const message = parts.slice(5).join('\x1f').trim();
    const parents = parentsRaw ? parentsRaw.split(/\s+/).filter(Boolean) : [];

    const modifiedFiles = [];
    let commitInsertions = 0;
    let commitDeletions = 0;

    for (let i = 1; i < lines.length; i += 1) {
      const parsed = parseNumstatLine(lines[i]);
      if (!parsed) continue;

      const ext = parsed.path.includes('.') ? parsed.path.slice(parsed.path.lastIndexOf('.')).toLowerCase() : '';
      if (jsOnly && !JS_EXT.has(ext)) continue;

      churnByFile[parsed.path] = (churnByFile[parsed.path] || 0) + 1;
      commitInsertions += parsed.insertions;
      commitDeletions += parsed.deletions;

      if (!fileStats[parsed.path]) {
        fileStats[parsed.path] = { commits: 0, insertions: 0, deletions: 0 };
      }
      fileStats[parsed.path].commits += 1;
      fileStats[parsed.path].insertions += parsed.insertions;
      fileStats[parsed.path].deletions += parsed.deletions;

      modifiedFiles.push({
        path: parsed.path,
        insertions: parsed.insertions,
        deletions: parsed.deletions,
      });
    }

    authors.add(`${authorName} <${authorEmail}>`);

    if (includeCommitDetails) {
      commits.push({
        hash,
        parents,
        author_name: authorName,
        author_email: authorEmail,
        authored_at: authoredAt,
        message,
        insertions: commitInsertions,
        deletions: commitDeletions,
        modified_files: modifiedFiles,
      });
    }
  }

  const commitCount = includeCommitDetails ? commits.length : blocks.length;

  return {
    ok: true,
    gitRoot,
    branch,
    revision,
    shallow,
    historyTotal,
    historyCapped: historyTotal != null && historyTotal > maxCommits,
    maxCommits,
    windowDays,
    engine: 'git-history-analyzer-js',
    commits,
    churnByFile,
    files: fileStats,
    authors: [...authors].sort(),
    summary: {
      commits: commitCount,
      author_count: authors.size,
      files_touched: Object.keys(churnByFile).length,
    },
  };
}

function pydrillerCompatiblePayload(analysis) {
  return {
    commits: analysis.summary.commits,
    churnByFile: analysis.churnByFile,
    commit_count: analysis.summary.commits,
    author_count: analysis.summary.author_count,
    files: analysis.files,
    branch: analysis.branch,
    shallow: analysis.shallow,
    historyTotal: analysis.historyTotal,
    historyCapped: analysis.historyCapped,
    maxCommits: analysis.maxCommits,
    window_days: analysis.windowDays,
    engine: analysis.engine,
    commit_details: analysis.commits,
  };
}

if (require.main === module) {
  const path = require('path');
  const fs = require('fs');
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const outPath = process.argv[3] ? path.resolve(process.argv[3]) : null;

  const analysis = analyzeGitHistory({
    root,
    maxCommits: parseIntSafe(process.env.PYDRILLER_MAX_COMMITS, DEFAULT_MAX_COMMITS),
    windowDays: process.env.PYDRILLER_WINDOW_DAYS
      ? parseIntSafe(process.env.PYDRILLER_WINDOW_DAYS, null)
      : null,
    jsOnly: process.env.PYDRILLER_JS_ONLY !== '0',
    includeCommitDetails: true,
  });

  if (!analysis.ok) {
    console.error(analysis.error);
    process.exit(1);
  }

  const json = JSON.stringify(analysis, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, json);
  } else {
    process.stdout.write(`${json}\n`);
  }
  process.exit(0);
}

module.exports = {
  analyzeGitHistory,
  pydrillerCompatiblePayload,
  DEFAULT_MAX_COMMITS,
};