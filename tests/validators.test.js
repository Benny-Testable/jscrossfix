'use strict';

const assert = require('node:assert/strict');
const { isValidEmail, isValidPhone, requireString, validateMember } = require('../src/validators');
const { ValidationError } = require('../src/errors');

describe('validators', () => {
  describe('isValidEmail', () => {
    it('accepts a normal address', () => {
      assert.equal(isValidEmail('ana.silva@example.com'), true);
    });

    it('rejects a missing domain', () => {
      assert.equal(isValidEmail('ana@'), false);
      assert.equal(isValidEmail(42), false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts an international number', () => {
      assert.equal(isValidPhone('+1 (555) 010-0199'), true);
    });

    it('rejects short numbers', () => {
      assert.equal(isValidPhone('12345'), false);
    });
  });

  describe('requireString', () => {
    it('trims the value', () => {
      assert.equal(requireString('name', '  Rosa  '), 'Rosa');
    });

    it('throws for non strings and short values', () => {
      assert.throws(() => requireString('name', 5), ValidationError);
      assert.throws(() => requireString('name', 'a', { min: 2 }), /at least 2/);
    });

    it('throws for long values', () => {
      assert.throws(() => requireString('name', 'abcdef', { max: 3 }), /at most 3/);
    });
  });

  describe('validateMember', () => {
    it('normalizes a valid member', () => {
      const member = validateMember({ name: ' Ana Silva ', email: 'Ana@Example.com ', phone: '+1 555 010 0199' });
      assert.deepEqual(member, {
        name: 'Ana Silva',
        email: 'ana@example.com',
        tier: 'standard',
        phone: '+1 555 010 0199',
      });
    });

    it('rejects unknown tiers', () => {
      assert.throws(() => validateMember({ name: 'Ana Silva', email: 'ana@example.com', tier: 'gold' }), /tier/);
    });

    it('rejects an impossible birth year', () => {
      assert.throws(() => validateMember({ name: 'Ana Silva', email: 'ana@example.com', birthYear: 1850 }), /birthYear/);
    });

    it('requires an object', () => {
      assert.throws(() => validateMember(null), /required/);
    });
  });
});
