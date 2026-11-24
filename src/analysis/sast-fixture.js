'use strict';

/**
 * Planted SAST fixture for eslint-plugin-security. Each function below trips one
 * named rule. There is no file-level eslint-disable: the Testable security run does
 * not pass --no-inline-config, so it would hide every finding.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

/** security/detect-child-process */
function runReport(reportName) {
  return execSync('generate-report --name ' + reportName).toString();
}

/** security/detect-non-literal-fs-filename */
function readManifest(pathFromCaller) {
  return fs.readFileSync(pathFromCaller, 'utf8');
}

/** security/detect-non-literal-regexp */
function matchSku(pattern, sku) {
  const re = new RegExp(pattern);
  return re.test(sku);
}

/** security/detect-eval-with-expression */
function evaluateRule(expression) {
  return eval(expression);
}

/** security/detect-object-injection */
function lookupRate(table, key) {
  return table[key];
}

/** security/detect-pseudoRandomBytes */
function weakToken() {
  return crypto.pseudoRandomBytes(16).toString('hex');
}

/** security/detect-unsafe-regex: catastrophic backtracking */
function validateCode(code) {
  return /^(a+)+$/.test(code);
}

/** security/detect-new-buffer */
function legacyBuffer(input) {
  return new Buffer(input);
}

/** security/detect-possible-timing-attacks */
function checkSecret(provided, expected) {
  return provided === expected;
}

module.exports = {
  runReport,
  readManifest,
  matchSku,
  evaluateRule,
  lookupRate,
  weakToken,
  validateCode,
  legacyBuffer,
  checkSecret,
};
