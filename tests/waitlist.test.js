'use strict';

const assert = require('node:assert/strict');
const { Waitlist } = require('../src/waitlist');
const { MemberRegistry } = require('../src/members');
const { ConflictError, NotFoundError } = require('../src/errors');

function setup() {
  const registry = new MemberRegistry();
  const a = registry.register({ name: 'Ana Silva', email: 'ana@example.com' });
  const b = registry.register({ name: 'Ben Okafor', email: 'ben@example.com', tier: 'family' });
  const c = registry.register({ name: 'Cleo Park', email: 'cleo@example.com' });
  return { registry, a, b, c };
}

describe('Waitlist', () => {
  it('orders by priority then arrival', () => {
    const { a, b, c } = setup();
    const list = new Waitlist();
    list.join(a);
    list.join(b);
    list.join(c);
    assert.deepEqual(list.entries.map((e) => e.memberId), ['m2', 'm1', 'm3']);
    assert.equal(list.size(), 3);
  });

  it('reports one based queue positions', () => {
    const { a, b } = setup();
    const list = new Waitlist();
    list.join(a);
    list.join(b);
    assert.equal(list.position('m2'), 1);
    assert.equal(list.position('m1'), 2);
  });

  it('rejects duplicates and unknown members', () => {
    const { a } = setup();
    const list = new Waitlist();
    list.join(a);
    assert.throws(() => list.join(a), ConflictError);
    assert.throws(() => list.position('m9'), NotFoundError);
  });

  it('removes entries', () => {
    const { a } = setup();
    const list = new Waitlist();
    list.join(a);
    assert.equal(list.leave('m1'), true);
    assert.equal(list.leave('m1'), false);
  });

  it('matches zones when promoting', () => {
    const { registry, a, b } = setup();
    const list = new Waitlist();
    list.join(a, 'A');
    list.join(b, 'B');
    const done = list.promote([{ id: 'p1', zone: 'A' }, { id: 'p2', zone: 'C' }], registry);
    assert.deepEqual(done, [{ memberId: 'm1', plotId: 'p1' }]);
    assert.equal(list.size(), 1);
  });

  it('drops members who cannot take another plot', () => {
    const { registry, a } = setup();
    registry.claimPlot('m1', 'x1');
    registry.claimPlot('m1', 'x2');
    const list = new Waitlist();
    list.join(a);
    const done = list.promote([{ id: 'p1', zone: 'A' }], registry);
    assert.deepEqual(done, []);
    assert.equal(list.size(), 0);
  });

  it('rethrows unexpected promotion errors', () => {
    const list = new Waitlist();
    list.join({ id: 'm1', tier: 'standard' });
    assert.throws(() => list.promote([{ id: 'p1', zone: 'A' }], { claimPlot: () => { throw new TypeError('boom'); } }), TypeError);
  });
});
