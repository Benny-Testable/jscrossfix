'use strict';

const assert = require('node:assert/strict');
const schedule = require('../src/schedule');

const d = (iso) => new Date(`${iso}T00:00:00Z`);

describe('schedule', () => {
  it('counts days between dates', () => {
    assert.equal(schedule.daysBetween(d('2026-03-01'), d('2026-03-15')), 14);
    assert.equal(schedule.daysBetween(d('2026-03-15'), d('2026-03-01')), -14);
  });

  it('computes iso weeks', () => {
    assert.equal(schedule.isoWeek(d('2026-01-05')), 2);
    assert.equal(schedule.isoWeek(d('2026-06-15')), 25);
  });

  it('adds months', () => {
    assert.equal(schedule.addMonths(d('2026-01-10'), 2).toISOString().slice(0, 10), '2026-03-10');
  });

  it('clamps month end dates instead of overflowing', () => {
    assert.equal(schedule.addMonths(d('2026-01-31'), 1).toISOString().slice(0, 10), '2026-02-28');
    assert.equal(schedule.addMonths(d('2024-01-31'), 1).toISOString().slice(0, 10), '2024-02-29');
    assert.equal(schedule.addMonths(d('2026-11-30'), 3).toISOString().slice(0, 10), '2027-02-28');
    assert.equal(schedule.renewalDate(d('2026-08-31'), 1).toISOString().slice(0, 10), '2026-09-30');
  });

  it('builds a watering rota that wraps around the members', () => {
    const rota = schedule.wateringRota(['m1', 'm2', 'm3'], d('2026-05-04'), 3);
    assert.equal(rota.length, 3);
    assert.deepEqual(rota[0].duty, ['m1', 'm2']);
    assert.deepEqual(rota[1].duty, ['m3', 'm1']);
    assert.equal(rota[1].start, '2026-05-11');
    assert.deepEqual(schedule.wateringRota([], d('2026-05-04'), 3), []);
  });

  it('finds the next season start', () => {
    assert.equal(schedule.nextSeasonStart(d('2026-01-15')).toISOString().slice(0, 10), '2026-03-01');
    assert.equal(schedule.nextSeasonStart(d('2026-06-15')).toISOString().slice(0, 10), '2027-03-01');
  });

  it('computes renewal dates', () => {
    assert.equal(schedule.renewalDate(d('2026-02-10'), 12).toISOString().slice(0, 10), '2027-02-10');
  });
});
