'use strict';

/**
 * Invented student and customer records for the Presidio PII scan (FERPA/COPPA rows:
 * PII in Codebase Detection, Student PII Exposure Scan). Every person, number and address
 * below is made up; the SSN and card numbers are well-known documentation examples.
 */
const SEED_STUDENTS = [
  {
    fullName: 'Jennifer Alvarez',
    email: 'jennifer.alvarez@example-school.org',
    phone: '(415) 555-0132',
    ssn: '219-09-9999',
    dateOfBirth: 'March 14, 2009',
    card: '4111 1111 1111 1111',
  },
  {
    fullName: "Michael O'Connor",
    email: 'michael.oconnor@example-school.org',
    phone: '212-555-0187',
    ssn: '457-55-5462',
    dateOfBirth: 'July 2, 2010',
    card: '5555 5555 5555 4444',
  },
];

function studentContactLine(student) {
  return student.fullName + ' <' + student.email + '> ' + student.phone;
}

module.exports = { SEED_STUDENTS, studentContactLine };
