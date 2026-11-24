/**
 * defect-clone-fixture.js
 *
 * Intentional clone pairs for defect-propagation and risk-based-testing
 * metrics. Two functions share an identical validation block so jscpd
 * registers a clone pair; subsequent bug-fix commits touching this file
 * give pydriller the history it needs to compute:
 *   • Defect Propagation Risk Detection
 *   • Risk-Based Testing Prioritization
 */

'use strict';

// ─── Clone Fragment A ────────────────────────────────────────────────────────
// validateUserRecord: validates an incoming user payload.
function validateUserRecord(record) {
  if (!record || typeof record !== 'object') {
    throw new TypeError('record must be a non-null object');
  }
  if (typeof record.id !== 'string' || record.id.trim() === '') {
    throw new RangeError('record.id must be a non-empty string');
  }
  if (typeof record.email !== 'string' || !record.email.includes('@')) {
    throw new RangeError('record.email must be a valid email address');
  }
  if (record.age !== undefined && (typeof record.age !== 'number' || record.age < 0 || record.age > 150)) {
    throw new RangeError('record.age must be a non-negative number not exceeding 150');
  }
  return { valid: true, id: record.id.trim(), email: record.email.toLowerCase() };
}

// ─── Clone Fragment B ────────────────────────────────────────────────────────
// validateAdminRecord: same structural validation for admin payloads.
// (intentional clone of validateUserRecord — both share the same guard logic)
function validateAdminRecord(record) {
  if (!record || typeof record !== 'object') {
    throw new TypeError('record must be a non-null object');
  }
  if (typeof record.id !== 'string' || record.id.trim() === '') {
    throw new RangeError('record.id must be a non-empty string');
  }
  if (typeof record.email !== 'string' || !record.email.includes('@')) {
    throw new RangeError('record.email must be a valid email address');
  }
  if (record.age !== undefined && (typeof record.age !== 'number' || record.age < 0 || record.age > 150)) {
    throw new RangeError('record.age must be a non-negative number not exceeding 150');
  }
  return { valid: true, id: record.id.trim(), email: record.email.toLowerCase(), role: 'admin' };
}

// ─── Exports ─────────────────────────────────────────────────────────────────
module.exports = { validateUserRecord, validateAdminRecord };
