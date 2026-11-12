'use strict';

const assert = require('node:assert/strict');
const { GardenError, ValidationError, ConflictError, NotFoundError } = require('../src/errors');

describe('errors', () => {
  it('carries a default code', () => {
    const error = new GardenError('boom');
    assert.equal(error.code, 'GARDEN_ERROR');
    assert.equal(error.name, 'GardenError');
    assert.ok(error instanceof Error);
  });

  it('describes validation problems', () => {
    const error = new ValidationError('email', 'is bad');
    assert.equal(error.message, 'email: is bad');
    assert.equal(error.code, 'VALIDATION');
    assert.equal(error.field, 'email');
    assert.equal(error.name, 'ValidationError');
    assert.ok(error instanceof GardenError);
  });

  it('describes conflicts and missing records', () => {
    const conflict = new ConflictError('taken');
    assert.equal(conflict.code, 'CONFLICT');
    assert.equal(conflict.name, 'ConflictError');
    const missing = new NotFoundError('plot', 'p7');
    assert.equal(missing.message, 'plot p7 not found');
    assert.equal(missing.code, 'NOT_FOUND');
    assert.equal(missing.kind, 'plot');
    assert.equal(missing.id, 'p7');
    assert.equal(missing.name, 'NotFoundError');
  });
});
