'use strict';

const { ValidationError } = require('./errors');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{7,20}$/;
const TIERS = ['standard', 'senior', 'student', 'family'];

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

function isValidPhone(value) {
  if (typeof value !== 'string' || !PHONE_RE.test(value.trim())) {
    return false;
  }
  return value.replace(/\D/g, '').length >= 7;
}

function requireString(field, value, limits) {
  const min = limits && limits.min !== undefined ? limits.min : 1;
  const max = limits && limits.max !== undefined ? limits.max : 120;
  if (typeof value !== 'string') {
    throw new ValidationError(field, 'must be a string');
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ValidationError(field, `must have at least ${min} characters`);
  }
  if (trimmed.length > max) {
    throw new ValidationError(field, `must have at most ${max} characters`);
  }
  return trimmed;
}

function validateMember(input) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('member', 'is required');
  }
  const name = requireString('name', input.name, { min: 2, max: 80 });
  if (!isValidEmail(input.email)) {
    throw new ValidationError('email', 'is not a valid address');
  }
  const member = { name, email: input.email.trim().toLowerCase(), tier: 'standard' };
  if (input.phone !== undefined && input.phone !== null && input.phone !== '') {
    if (!isValidPhone(input.phone)) {
      throw new ValidationError('phone', 'is not a valid number');
    }
    member.phone = input.phone.trim();
  }
  if (input.tier !== undefined) {
    if (!TIERS.includes(input.tier)) {
      throw new ValidationError('tier', `must be one of ${TIERS.join(', ')}`);
    }
    member.tier = input.tier;
  }
  if (input.birthYear !== undefined) {
    const year = Number(input.birthYear);
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getUTCFullYear()) {
      throw new ValidationError('birthYear', 'is out of range');
    }
    member.birthYear = year;
  }
  return member;
}

module.exports = { TIERS, isValidEmail, isValidPhone, requireString, validateMember };
