'use strict';

/**
 * Extended student and employee PII seed data for the Presidio PII scan.
 * All persons, numbers, addresses and identifiers are entirely invented.
 * SSNs are well-known documentation examples and are never real.
 */

const SEED_STUDENTS = [
  {
    fullName: 'Jennifer Alvarez',
    email: 'jennifer.alvarez@example-school.org',
    phone: '(415) 555-0132',
    ssn: '219-09-9999',
    dateOfBirth: 'March 14, 2009',
    card: '4111 1111 1111 1111',
    studentId: 'STU-20090314-001',
    address: '123 Maple Street, Springfield, IL 62701',
    passportNumber: 'A12345678',
    driverLicense: 'D1234567',
  },
  {
    fullName: "Michael O'Connor",
    email: 'michael.oconnor@example-school.org',
    phone: '212-555-0187',
    ssn: '457-55-5462',
    dateOfBirth: 'July 2, 2010',
    card: '5555 5555 5555 4444',
    studentId: 'STU-20100702-002',
    address: '456 Oak Avenue, Portland, OR 97201',
    passportNumber: 'B98765432',
    driverLicense: 'E9876543',
  },
  {
    fullName: 'Priya Nair',
    email: 'priya.nair@example-school.org',
    phone: '(650) 555-0199',
    ssn: '123-45-6789',
    dateOfBirth: 'November 20, 2008',
    card: '3782 822463 10005',
    studentId: 'STU-20081120-003',
    address: '789 Pine Road, Austin, TX 78701',
    nationalId: 'ID-TX-2008-003',
    medicalRecordNumber: 'MRN-20081120',
  },
  {
    fullName: 'Carlos Rivera',
    email: 'carlos.rivera@example-school.org',
    phone: '(305) 555-0145',
    ssn: '987-65-4321',
    dateOfBirth: 'January 5, 2011',
    card: '6011 1111 1111 1117',
    studentId: 'STU-20110105-004',
    address: '321 Elm Street, Miami, FL 33101',
    passportNumber: 'C11223344',
    bankAccount: '1234567890',
  },
  {
    fullName: 'Aisha Mohammed',
    email: 'aisha.mohammed@example-school.org',
    phone: '(212) 555-0123',
    ssn: '111-22-3333',
    dateOfBirth: 'June 15, 2009',
    card: '5105 1051 0510 5100',
    studentId: 'STU-20090615-005',
    address: '654 Cedar Lane, New York, NY 10001',
    taxId: 'TIN-111223333',
    ipAddress: '192.168.1.100',
  },
];

const SEED_EMPLOYEES = [
  {
    fullName: 'Robert Johnson',
    email: 'robert.johnson@example-corp.com',
    phone: '(408) 555-0177',
    ssn: '444-55-6666',
    employeeId: 'EMP-2023-001',
    salary: 85000,
    bankAccount: '9876543210',
    routingNumber: '021000021',
    dateOfBirth: 'April 12, 1985',
    address: '987 Willow Way, San Jose, CA 95101',
  },
  {
    fullName: 'Linda Chen',
    email: 'linda.chen@example-corp.com',
    phone: '(206) 555-0188',
    ssn: '777-88-9999',
    employeeId: 'EMP-2023-002',
    salary: 92000,
    bankAccount: '1122334455',
    dateOfBirth: 'August 30, 1990',
    address: '135 Birch Boulevard, Seattle, WA 98101',
  },
];

function studentContactLine(student) {
  return student.fullName + ' <' + student.email + '> ' + student.phone;
}

function employeeRecord(employee) {
  return {
    id: employee.employeeId,
    name: employee.fullName,
    contact: employee.email,
  };
}

module.exports = { SEED_STUDENTS, SEED_EMPLOYEES, studentContactLine, employeeRecord };
