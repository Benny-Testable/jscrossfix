'use strict';

class GardenError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'GardenError';
    this.code = code || 'GARDEN_ERROR';
  }
}

class ValidationError extends GardenError {
  constructor(field, message) {
    super(`${field}: ${message}`, 'VALIDATION');
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ConflictError extends GardenError {
  constructor(message) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

class NotFoundError extends GardenError {
  constructor(kind, id) {
    super(`${kind} ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
    this.kind = kind;
    this.id = id;
  }
}

module.exports = { GardenError, ValidationError, ConflictError, NotFoundError };
