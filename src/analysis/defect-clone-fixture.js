'use strict';

function validateFields(record) {
  if (!record || typeof record !== 'object') {
    throw new TypeError('Record must be an object');
  }
  const id = typeof record.id === 'string' ? record.id.trim() : '';
  if (!id) throw new RangeError('Record id must be a non-empty string');

  const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : '';
  if (!email.includes('@')) throw new RangeError('Record email must be valid');

  if (record.age !== undefined) {
    if (typeof record.age !== 'number' || Number.isNaN(record.age) || record.age < 0 || record.age > 150) {
      throw new RangeError('Record age must be between 0 and 150');
    }
  }
  return { id, email };
}

function validateUserRecord(record) {
  const { id, email } = validateFields(record);
  return { valid: true, id, email };
}

function validateAdminRecord(record) {
  const { id, email } = validateFields(record);
  return { valid: true, id, email, role: 'admin' };
}

module.exports = { validateUserRecord, validateAdminRecord };