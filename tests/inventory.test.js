'use strict';

const assert = require('node:assert/strict');
const { ToolInventory } = require('../src/inventory');
const { DAY } = require('../src/schedule');

const NOW = Date.UTC(2026, 4, 10);

function stocked() {
  const inv = new ToolInventory();
  inv.add('t1', 'shovel');
  inv.add('t2', 'tiller', 'new');
  inv.add('t3', 'rake');
  inv.add('t4', 'shovel', 'broken');
  return inv;
}

describe('ToolInventory', () => {
  it('adds tools and validates conditions', () => {
    const inv = stocked();
    assert.equal(inv.tools.size, 4);
    assert.throws(() => inv.add('t1', 'shovel'), /already exists/);
    assert.throws(() => inv.add('t9', 'shovel', 'shiny'), /condition/);
  });

  it('computes loan periods per kind', () => {
    const inv = stocked();
    assert.equal(inv.loanPeriod('tiller'), DAY);
    assert.equal(inv.loanPeriod('rake'), 5 * DAY);
  });

  it('checks tools out and in', () => {
    const inv = stocked();
    const loan = inv.checkout('t1', 'm1', NOW);
    assert.equal(loan.due, NOW + 3 * DAY);
    assert.equal(inv.checkin('t1', NOW + 2 * DAY, 'worn'), 0);
    assert.equal(inv.tools.get('t1').condition, 'worn');
  });

  it('refuses unavailable tools', () => {
    const inv = stocked();
    inv.checkout('t1', 'm1', NOW);
    assert.throws(() => inv.checkout('t1', 'm2', NOW), /already on loan/);
    assert.throws(() => inv.checkout('t4', 'm2', NOW), /broken/);
    assert.throws(() => inv.checkout('t9', 'm2', NOW), /not found/);
  });

  it('limits open loans per member', () => {
    const inv = stocked();
    inv.checkout('t1', 'm1', NOW);
    inv.checkout('t2', 'm1', NOW);
    assert.throws(() => inv.checkout('t3', 'm1', NOW), /too many/);
  });

  it('returns late days on check in', () => {
    const inv = stocked();
    inv.checkout('t2', 'm1', NOW);
    assert.equal(inv.checkin('t2', NOW + 3 * DAY), 2);
    assert.throws(() => inv.checkin('t2', NOW), /not found/);
  });

  it('lists overdue loans by severity', () => {
    const inv = stocked();
    inv.checkout('t1', 'm1', NOW);
    inv.checkout('t2', 'm2', NOW);
    const late = inv.overdue(NOW + 20 * DAY);
    assert.deepEqual(late.map((l) => l.severity), ['suspend', 'suspend']);
    const soon = inv.overdue(NOW + 5 * DAY);
    assert.equal(soon[0].severity, 'notice');
    assert.equal(inv.overdue(NOW + 11 * DAY)[0].severity, 'warning');
  });

  it('counts tools per kind', () => {
    assert.deepEqual(stocked().countByKind(), { shovel: 2, tiller: 1, rake: 1 });
  });
});
