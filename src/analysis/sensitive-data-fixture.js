'use strict';

const fs = require('fs');
const { createHash } = require('crypto');

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

function purgeExportAuthorized(role, target) {
  authorize(role);
  fs.rmSync(target, { force: true });
}

const insecureAgentOptions = { rejectUnauthorized: false, keepAlive: true };

function legacyDigest(value) {
  return createHash('md5').update(value).digest('hex');
}

function renderBanner(element, banner) {
  element.innerHTML = banner;
}

function sameToken(providedToken, expectedToken) {
  return providedToken === expectedToken;
}

module.exports = {
  maskPii,
  exportCustomerSafely,
  authorize,
  purgeExportAuthorized,
  insecureAgentOptions,
  legacyDigest,
  renderBanner,
  sameToken,
};