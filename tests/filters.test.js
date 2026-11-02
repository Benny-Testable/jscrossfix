'use strict';

const assert = require('node:assert/strict');
const { parseFilters, filterPlots, toQuery } = require('../src/filters');
const { createPlot, assignOwner } = require('../src/plots');

const plots = [
  createPlot('p1', { zone: 'a', row: 1, width: 2, length: 2, hasWater: true }),
  assignOwner(createPlot('p2', { zone: 'a', row: 2, width: 4, length: 5 }), 'm1'),
  createPlot('p3', { zone: 'b', row: 1, width: 3, length: 3, soil: 'clay' }),
];

describe('filters', () => {
  it('parses typed values', () => {
    const filters = parseFilters('?zone=A&hasWater=true&min_area=5');
    assert.deepEqual(filters, { zone: 'A', hasWater: true, min_area: 5 });
    assert.deepEqual(parseFilters(''), {});
  });

  it('rejects non numeric areas', () => {
    assert.throws(() => parseFilters('min_area=big'), /number/);
  });

  it('filters by zone and area', () => {
    assert.deepEqual(filterPlots(plots, 'zone=A&min_area=5').map((p) => p.id), ['p2']);
    assert.deepEqual(filterPlots(plots, 'max_area=4').map((p) => p.id), ['p1']);
  });

  it('filters by free state and soil', () => {
    assert.deepEqual(filterPlots(plots, 'free=true').map((p) => p.id), ['p1', 'p3']);
    assert.deepEqual(filterPlots(plots, 'free=false').map((p) => p.id), ['p2']);
    assert.deepEqual(filterPlots(plots, 'soil=clay').map((p) => p.id), ['p3']);
  });

  it('serializes filters', () => {
    assert.equal(toQuery({ zone: 'A', free: true }), 'free=true&zone=A');
  });
});
