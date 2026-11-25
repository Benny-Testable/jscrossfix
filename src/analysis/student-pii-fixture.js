'use strict';

/**
 * Anonymized fixture records (no real or synthetic PII patterns).
 */
const SEED_STUDENTS = [
  { fullName: 'Record-001', email: 'record-001.invalid', phone: 'ext-001' },
  { fullName: 'Record-002', email: 'record-002.invalid', phone: 'ext-002' },
  { fullName: 'Record-003', email: 'record-003.invalid', phone: 'ext-003' },
  { fullName: 'Record-004', email: 'record-004.invalid', phone: 'ext-004' },
  { fullName: 'Record-005', email: 'record-005.invalid', phone: 'ext-005' },
];

function studentContactLine(student) {
  return student.fullName + ' <' + student.email + '> ' + student.phone;
}

module.exports = { SEED_STUDENTS, studentContactLine };