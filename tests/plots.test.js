'use strict';

const assert = require('node:assert/strict');
const plots = require('../src/plots');

function sample(id, extra) {
  return plots.createPlot(id, Object.assign({ zone: 'b', row: 2, width: 3, length: 4 }, extra));
}

describe('plots', () => {
  it('creates a plot with defaults', () => {
    const plot = plots.createPlot('p1', { width: 2, length: 5 });
    assert.equal(plot.zone, 'A');
    assert.equal(plot.soil, 'loam');
    assert.equal(plot.owner, null);
    assert.equal(plots.area(plot), 10);
  });

  it('rejects invalid input', () => {
    assert.throws(() => plots.createPlot('', {}), /id/);
    assert.throws(() => plots.createPlot('p1'), /plot/);
    assert.throws(() => plots.createPlot('p1', { width: 0, length: 3 }), /size/);
    assert.throws(() => plots.createPlot('p1', { width: 1, length: 3, soil: 'lava' }), /soil/);
  });

  it('groups plots by zone', () => {
    const zones = plots.groupByZone([sample('p1'), sample('p2', { zone: 'c' }), sample('p3')]);
    assert.equal(zones.get('B').length, 2);
    assert.equal(zones.get('C').length, 1);
  });

  it('finds neighbours in the same zone', () => {
    const all = [sample('p1'), sample('p2', { row: 3 }), sample('p3', { row: 5 }), sample('p4', { zone: 'c' })];
    const near = plots.findNeighbours(all, all[0]).map((p) => p.id);
    assert.deepEqual(near, ['p2']);
  });

  it('assigns and releases owners', () => {
    const plot = plots.assignOwner(sample('p1'), 'm1');
    assert.equal(plot.owner, 'm1');
    assert.equal(plots.assignOwner(plot, 'm1').owner, 'm1');
    assert.throws(() => plots.assignOwner(plot, 'm2'), /already assigned/);
    assert.equal(plots.releasePlot(plot).owner, null);
  });
});
