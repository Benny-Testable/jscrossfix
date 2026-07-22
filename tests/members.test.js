'use strict';

const assert = require('node:assert/strict');
const { MemberRegistry } = require('../src/members');
const { ConflictError, NotFoundError } = require('../src/errors');

function seeded() {
  const registry = new MemberRegistry();
  registry.register({ name: 'Ana Silva', email: 'ana@example.com' });
  registry.register({ name: 'Ben Okafor', email: 'ben@example.com', tier: 'student' });
  return registry;
}

describe('MemberRegistry', () => {
  it('registers members with sequential ids', () => {
    const registry = seeded();
    assert.equal(registry.get('m1').name, 'Ana Silva');
    assert.equal(registry.get('m2').tier, 'student');
  });

  it('rejects duplicate emails', () => {
    const registry = seeded();
    assert.throws(() => registry.register({ name: 'Ana Two', email: 'ANA@example.com' }), ConflictError);
  });

  it('throws for unknown members', () => {
    assert.throws(() => seeded().get('m99'), NotFoundError);
  });

  it('changes tier', () => {
    const registry = seeded();
    assert.equal(registry.changeTier('m1', 'family').tier, 'family');
    assert.throws(() => registry.changeTier('m1', 'vip'), /tier/);
  });

  it('limits plots per member', () => {
    const registry = seeded();
    registry.claimPlot('m1', 'p1');
    registry.claimPlot('m1', 'p1');
    registry.claimPlot('m1', 'p2');
    assert.equal(registry.get('m1').plots.length, 2);
    assert.throws(() => registry.claimPlot('m1', 'p3'), /already holds 2 plots/);
    assert.equal(registry.claimPlot('m1', 'p3', 3).plots.length, 3);
  });

  it('releases plots on deactivation', () => {
    const registry = seeded();
    registry.claimPlot('m1', 'p1');
    assert.deepEqual(registry.deactivate('m1'), ['p1']);
    assert.throws(() => registry.claimPlot('m1', 'p2'), /not active/);
  });

  it('searches by name or email', () => {
    const registry = seeded();
    assert.equal(registry.search('okafor').length, 1);
    assert.equal(registry.search('example.com').length, 2);
    assert.deepEqual(registry.search('').map((m) => m.id), ['m1', 'm2']);
  });

  it('counts active members per tier', () => {
    const registry = seeded();
    registry.deactivate('m2');
    assert.deepEqual(registry.countByTier(), { standard: 1 });
  });
});
