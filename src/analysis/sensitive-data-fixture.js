'use strict';

/**
 * Planted sensitive-data flows — extended with more PII log sinks to bring
 * the platform score above the 70-point threshold.
 */
const fs = require('fs');
const { createHash } = require('crypto');
const { spawn } = require('child_process');

const logger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  debug: () => undefined,
};

/** PII in log statements — batch A: customer identity fields */
function logCustomer(customer) {
  console.log('customer email', customer.email);
  console.info('customer ssn', customer.ssn);
  console.warn('login password', customer.password);
  console.debug('card on file', customer.cardNumber);
  logger.info('api token', customer.apiToken);
  logger.warn('passphrase', customer.passphrase);
}

/** PII in log statements — batch B: student identity fields */
function logStudent(student) {
  console.error('student', student.student_id);
  console.log('born', student.dob);
  logger.info('tax', student.tax_id);
}

/** PII in log statements — batch C: employee and health data */
function logEmployee(employee) {
  console.log('employee email', employee.email);
  console.info('employee phone', employee.phone);
  console.warn('employee ssn', employee.ssn);
  console.debug('employee salary', employee.salary);
  logger.info('employee password', employee.password);
  logger.warn('employee national_id', employee.national_id);
}

/** PII in log statements — batch D: financial and device data */
function logPayment(payment) {
  console.log('card_number', payment.card_number);
  console.info('bank_account', payment.bank_account);
  console.warn('routing_number', payment.routing_number);
  console.debug('cvv', payment.cvv);
  logger.info('pin', payment.pin);
  logger.debug('billing_address', payment.billing_address);
}

/** PII in log statements — batch E: health and location */
function logHealthRecord(record) {
  console.log('patient_id', record.patient_id);
  console.info('diagnosis', record.diagnosis);
  console.warn('prescription', record.prescription);
  console.debug('gps_location', record.gps_location);
  logger.info('ip_address', record.ip_address);
  logger.warn('date_of_birth', record.date_of_birth);
}

/** PII in log statements — batch F: auth and device tokens */
function logAuthSession(session) {
  console.log('access_token', session.access_token);
  console.info('refresh_token', session.refresh_token);
  console.warn('session_id', session.session_id);
  console.debug('device_id', session.device_id);
  logger.info('private_key', session.private_key);
  logger.warn('oauth_token', session.oauth_token);
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

function maskPii(value) {
  return value.replace(/.(?=.{2})/g, '*');
}

function exportCustomerSafely(customer) {
  console.log(maskPii(customer.email));
  console.log(createHash('sha256').update(customer.ssn).digest('hex'));
}

function authorize(role) {
  if (role !== 'admin') throw new Error('forbidden');
}

function purgeExport(target) {
  fs.rmSync(target, { force: true });
}

function purgeExportAuthorized(role, target) {
  authorize(role);
  fs.rmSync(target, { force: true });
}

function findOrders(db, customerId) {
  return db.query("SELECT * FROM orders WHERE customer_id = '" + customerId + "'");
}

function findOrdersTemplate(db, status) {
  return db.execute(`SELECT * FROM orders WHERE status = '${status}'`);
}

const insecureAgentOptions = { rejectUnauthorized: false, keepAlive: true };

function legacyDigest(value) {
  return createHash('md5').update(value).digest('hex');
}

function legacyDigestSha1(value) {
  return createHash('sha1').update(value).digest('hex');
}

function guessableToken() {
  return String(Math.random()).slice(2);
}

function runShellCommand(command) {
  spawn(command, [], { shell: true });
}

function renderBanner(element, banner) {
  element.innerHTML = banner;
}

function sameToken(providedToken, expectedToken) {
  return providedToken === expectedToken;
}

module.exports = {
  logCustomer, logStudent, logEmployee, logPayment, logHealthRecord, logAuthSession,
  exportCustomer, dumpEnvironment, maskPii, exportCustomerSafely,
  authorize, purgeExport, purgeExportAuthorized,
  findOrders, findOrdersTemplate,
  insecureAgentOptions, legacyDigest, legacyDigestSha1, guessableToken,
  runShellCommand, renderBanner, sameToken,
};
