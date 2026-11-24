'use strict';

/**
 * Planted taint flows. Sources are idiomatic for this project type: process.argv,
 * process.env and fields of an inbound payload object. Sinks are a child process,
 * the file system and a dynamic RegExp. The last function is the sanitised control.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/** FLOW 1: argv -> child_process. */
function exportFromArgv() {
  const target = process.argv[2];
  return execSync('order-export --id ' + target).toString();
}

/** FLOW 2: env -> filesystem read. */
function loadProfileFromEnv() {
  const profile = process.env.ORDER_PROFILE || 'default';
  return fs.readFileSync('/etc/orders/' + profile + '.json', 'utf8');
}

/** FLOW 3: inbound payload -> filesystem write. */
function writeExport(payload, body) {
  fs.writeFileSync(payload.exportPath, body, 'utf8');
}

/** FLOW 4: inbound payload -> dynamic RegExp. */
function buildFilter(payload) {
  return new RegExp(payload.filterPattern);
}

/**
 * CONTROL: sanitised. The same source class as flow 3, but the value is
 * constrained to a basename inside a fixed directory before it reaches the sink.
 */
const EXPORT_ROOT = '/var/lib/orders/exports';

function writeExportSafely(payload, body) {
  const safeName = path.basename(payload.exportPath).replace(/[^A-Za-z0-9._-]/g, '');
  if (safeName.length === 0) {
    throw new Error('refusing to write an empty export name');
  }
  const resolved = path.join(EXPORT_ROOT, safeName);
  if (!resolved.startsWith(EXPORT_ROOT + path.sep)) {
    throw new Error('path traversal rejected');
  }
  fs.writeFileSync(resolved, body, 'utf8');
}

module.exports = { exportFromArgv, loadProfileFromEnv, writeExport, buildFilter, writeExportSafely };
