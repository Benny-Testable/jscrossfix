'use strict';

const { ConflictError, ValidationError } = require('./errors');

const HOUR = 3600 * 1000;
const MAX_DURATION = 4 * HOUR;
const WEEK = 7 * 24 * HOUR;
const MAX_PER_WEEK = 3;

function overlaps(a, b) {
  return a.start <= b.end && b.start <= a.end;
}

class ReservationBook {
  constructor() {
    this.items = [];
    this.nextId = 1;
  }

  reserve(resource, memberId, start, end) {
    if (!resource || !memberId) {
      throw new ValidationError('reservation', 'resource and member are required');
    }
    if (!(end > start)) {
      throw new ValidationError('range', 'end must be after start');
    }
    if (end - start > MAX_DURATION) {
      throw new ValidationError('range', 'bookings are limited to 4 hours');
    }
    const candidate = { resource, memberId, start, end };
    let weekly = 0;
    for (const existing of this.items) {
      if (existing.resource === resource && overlaps(existing, candidate)) {
        throw new ConflictError(`${resource} is already booked in that slot`);
      }
      if (existing.memberId === memberId && Math.abs(existing.start - start) < WEEK) {
        weekly += 1;
      }
    }
    if (weekly >= MAX_PER_WEEK) {
      throw new ConflictError(`member ${memberId} reached the weekly limit`);
    }
    const booking = Object.assign({ id: `r${this.nextId}` }, candidate);
    this.nextId += 1;
    this.items.push(booking);
    return booking;
  }

  cancel(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  forResource(resource) {
    return this.items.filter((item) => item.resource === resource).sort((a, b) => a.start - b.start);
  }

  freeSlots(resource, dayStart, dayEnd, slotMs) {
    const taken = this.forResource(resource);
    const slots = [];
    for (let cursor = dayStart; cursor + slotMs <= dayEnd; cursor += slotMs) {
      const probe = { start: cursor, end: cursor + slotMs };
      let free = true;
      for (const booking of taken) {
        if (booking.start < probe.end && probe.start < booking.end) {
          free = false;
          break;
        }
      }
      if (free) {
        slots.push(cursor);
      }
    }
    return slots;
  }
}

module.exports = { HOUR, MAX_DURATION, MAX_PER_WEEK, overlaps, ReservationBook };
