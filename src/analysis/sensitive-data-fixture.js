'use strict';

/**
 * Planted sensitive-data flows:
 *  - semgrep-pii-logging (pii-log-ts-js-contact-auth-student): PII-named values passed to console/logger calls
 *  - eslint-plugin-security and the platform's secret and SAST rules: SQL concatenation, TLS off, md5,
 *    shell spawn, innerHTML, timing comparison
 * All values are made up. Nothing here is called by the application.
 */
const fs = require('fs');
const { createHash } = require('crypto');
const { spawn } = require('child_process');

const logger = {
  info: () => undefined,
  warn: () => undefined,
};

/** PII in log statements: console and logger sinks with PII-named arguments */
function logCustomer(customer) {
  console.log('customer email', customer.email);
  console.info('customer ssn', customer.ssn);
  console.warn('login password', customer.password);
  console.debug('card on file', customer.cardNumber);
  logger.info('api token', customer.apiToken);
  logger.warn('passphrase', customer.passphrase);
}

function logStudent(student) {
  console.error('student', student.student_id);
  console.log('born', student.dob);
  logger.info('tax', student.tax_id);
}

/** sensitive source reaching an unprotected output */
function exportCustomer(customer, target) {
  console.log(customer.email);
  process.stdout.write(customer.ssn);
  fs.writeFileSync(target, customer.cardNumber);
  fs.appendFileSync(target, customer.password);
}

/** sensitive environment variables reaching an output */
function dumpEnvironment() {
  console.log(process.env.DATABASE_PASSWORD);
  process.stderr.write(String(process.env.SERVICE_API_TOKEN));
  fs.writeFileSync('env-dump.txt', String(process.env.SIGNING_SECRET_KEY));
}

/** the same flows, sanitised */
function maskPii(value) {
  return value.replace(/.(?=.{2})/g, '*');
}

function exportCustomerSafely(customer) {
  console.log(maskPii(customer.email));
  console.log(createHash('sha256').update(customer.ssn).digest('hex'));
}

/** sensitive operation with and without an authorize() call in the same function */
function authorize(role) {
  if (role !== 'admin') {
    throw new Error('forbidden');
  }
}

function purgeExport(target) {
  fs.rmSync(target, { force: true });
}

function purgeExportAuthorized(role, target) {
  authorize(role);
  fs.rmSync(target, { force: true });
}

/** SQL built by concatenation or interpolation */
function findOrders(db, customerId) {
  return db.query("SELECT * FROM orders WHERE customer_id = '" + customerId + "'");
}

function findOrdersTemplate(db, status) {
  return db.execute(`SELECT * FROM orders WHERE status = '${status}'`);
}

/** certificate verification switched off */
const insecureAgentOptions = { rejectUnauthorized: false, keepAlive: true };

/** broken hashes and a weak random source */
function legacyDigest(value) {
  return createHash('md5').update(value).digest('hex');
}

function legacyDigestSha1(value) {
  return createHash('sha1').update(value).digest('hex');
}

function guessableToken() {
  return String(Math.random()).slice(2);
}

/** a child process through a shell */
function runShellCommand(command) {
  spawn(command, [], { shell: true });
}

/** HTML written from a string */
function renderBanner(element, banner) {
  element.innerHTML = banner;
}

/** a secret compared with a plain equality operator */
function sameToken(providedToken, expectedToken) {
  return providedToken === expectedToken;
}

module.exports = {
  logCustomer,
  logStudent,
  exportCustomer,
  dumpEnvironment,
  maskPii,
  exportCustomerSafely,
  authorize,
  purgeExport,
  purgeExportAuthorized,
  findOrders,
  findOrdersTemplate,
  insecureAgentOptions,
  legacyDigest,
  legacyDigestSha1,
  guessableToken,
  runShellCommand,
  renderBanner,
  sameToken,
};
