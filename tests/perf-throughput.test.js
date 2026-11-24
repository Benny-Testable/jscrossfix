'use strict';

const assert = require('node:assert/strict');
const { buildCube, pairUp, collectTotals } = require('../src/analysis/perf-fixture');
const { classifyOrder } = require('../src/analysis/complexity-sample');

// Performance tests: they exercise the performance-critical fixtures under a time budget,
// so the performance test code coverage row has real performance test code to measure.
// This file sits directly in tests/ because the npm test glob (tests/**/*.test.js) is not
// expanded recursively by the shell.

describe('performance: throughput budgets', () => {
  it('builds a 40 x 40 x 40 cube within two seconds', () => {
    const started = Date.now();
    const cells = buildCube(40);
    assert.equal(cells.length, 64000);
    assert.ok(Date.now() - started < 2000);
  });

  it('pairs two 300 element lists within two seconds', () => {
    const left = Array.from({ length: 300 }, (_, i) => i);
    const right = Array.from({ length: 300 }, (_, i) => i * 2);
    const started = Date.now();
    assert.equal(pairUp(left, right).length, 90000);
    assert.ok(Date.now() - started < 2000);
  });

  it('classifies 50000 orders within one second', () => {
    const started = Date.now();
    for (let i = 0; i < 50000; i++) {
      classifyOrder('retail', 'gold', i % 700, i, i % 2 === 0, 'us');
    }
    assert.ok(Date.now() - started < 1000);
  });

  it('collects doubled values and their sum from parallel callbacks', async () => {
    const result = await collectTotals([1, 2, 3]);
    assert.equal(result.sum, 6);
    assert.deepEqual(result.list.sort((a, b) => a - b), [2, 4, 6]);
  });
});
