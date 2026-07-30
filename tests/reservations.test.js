'use strict';

const assert = require('node:assert/strict');
const { HOUR, ReservationBook } = require('../src/reservations');
const { ConflictError, ValidationError } = require('../src/errors');

const T0 = Date.UTC(2026, 4, 2, 8, 0, 0);

describe('ReservationBook', () => {
  it('books a free slot', () => {
    const book = new ReservationBook();
    const booking = book.reserve('shed', 'm1', T0, T0 + 2 * HOUR);
    assert.equal(booking.id, 'r1');
    assert.equal(book.forResource('shed').length, 1);
  });

  it('rejects invalid ranges', () => {
    const book = new ReservationBook();
    assert.throws(() => book.reserve('shed', 'm1', T0, T0), ValidationError);
    assert.throws(() => book.reserve('shed', 'm1', T0, T0 + 5 * HOUR), /4 hours/);
    assert.throws(() => book.reserve('', 'm1', T0, T0 + HOUR), /required/);
  });

  it('rejects overlapping bookings', () => {
    const book = new ReservationBook();
    book.reserve('shed', 'm1', T0, T0 + 2 * HOUR);
    assert.throws(() => book.reserve('shed', 'm2', T0 + HOUR, T0 + 3 * HOUR), ConflictError);
    assert.equal(book.reserve('tools', 'm2', T0 + HOUR, T0 + 3 * HOUR).resource, 'tools');
  });

  it('enforces the weekly limit', () => {
    const book = new ReservationBook();
    book.reserve('shed', 'm1', T0, T0 + HOUR);
    book.reserve('tools', 'm1', T0, T0 + HOUR);
    book.reserve('water', 'm1', T0, T0 + HOUR);
    assert.throws(() => book.reserve('compost', 'm1', T0, T0 + HOUR), /weekly limit/);
    assert.equal(book.reserve('compost', 'm2', T0, T0 + HOUR).memberId, 'm2');
  });

  it('cancels bookings', () => {
    const book = new ReservationBook();
    const booking = book.reserve('shed', 'm1', T0, T0 + HOUR);
    assert.equal(book.cancel(booking.id), true);
    assert.equal(book.cancel(booking.id), false);
  });

  it('lists free slots', () => {
    const book = new ReservationBook();
    book.reserve('shed', 'm1', T0 + HOUR, T0 + 2 * HOUR);
    const slots = book.freeSlots('shed', T0, T0 + 4 * HOUR, HOUR);
    assert.deepEqual(slots, [T0, T0 + 2 * HOUR, T0 + 3 * HOUR]);
  });
});
