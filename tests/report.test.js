'use strict';

const assert = require('node:assert/strict');
const report = require('../src/report');
const { createPlot, assignOwner } = require('../src/plots');
const { MemberRegistry } = require('../src/members');

function fixtures() {
  const plots = [
    createPlot('p1', { zone: 'a', width: 2, length: 3, hasWater: true }),
    assignOwner(createPlot('p2', { zone: 'b', width: 4, length: 4 }), 'm1'),
  ];
  const registry = new MemberRegistry();
  registry.register({ name: 'Ana Silva', email: 'ana@example.com' });
  registry.register({ name: 'Ben Okafor', email: 'ben@example.com' });
  registry.claimPlot('m1', 'p2');
  registry.deactivate('m2');
  return { plots, members: Array.from(registry.members.values()) };
}

describe('report', () => {
  it('summarizes plots', () => {
    const { plots } = fixtures();
    const rows = report.plotSummary(plots);
    assert.deepEqual(rows.map((r) => r.value), [2, 22, 1, 1, 1]);
  });

  it('summarizes members', () => {
    const { members } = fixtures();
    const rows = report.memberSummary(members);
    assert.deepEqual(rows.map((r) => r.value), [2, 1, 1, 1, 1]);
  });

  it('counts plots per zone', () => {
    const { plots } = fixtures();
    assert.deepEqual(report.zoneBreakdown(plots), [
      { label: 'Zone A', value: 1 },
      { label: 'Zone B', value: 1 },
    ]);
  });

  it('renders escaped html', () => {
    const html = report.renderSection('A <b>', [{ label: 'x', value: 1 }]);
    assert.match(html, /A &lt;b&gt;/);
    assert.match(html, /<td>x<\/td><td>1<\/td>/);
  });

  it('builds the full report', () => {
    const { plots, members } = fixtures();
    const html = report.buildReport(plots, members);
    assert.match(html, /Total area/);
    assert.match(html, /Zone B/);
    assert.match(html, /Without plots/);
  });
});
