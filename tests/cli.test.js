'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { run } = require('../src/cli');

function capture(args) {
  let output = '';
  const code = run(args, (text) => {
    output += text;
  });
  return { code, output };
}

describe('cli', () => {
  it('quotes a fee', () => {
    const { code, output } = capture(['quote', '--area', '12', '--tier', 'student', '--water']);
    assert.equal(code, 0);
    assert.equal(output, '67.25\n');
  });

  it('imports a csv file', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'granite-cli-')), 'members.csv');
    fs.writeFileSync(file, 'name,email\nAna Silva,ana@example.com\nBad,nope\n');
    const { code, output } = capture(['import', file]);
    assert.equal(code, 0);
    assert.match(output, /imported 1, rejected 1/);
    assert.match(output, /line 3/);
  });

  it('prints a filtered report', () => {
    const { output } = capture(['report', '--filter', 'zone=B']);
    assert.match(output, /Zone B/);
    assert.doesNotMatch(output, /Zone A/);
  });

  it('returns a failure code for unknown commands', () => {
    assert.equal(capture(['bogus']).code, 1);
  });

  it('reports runtime errors', () => {
    const { code, output } = capture(['import', '/definitely/missing.csv']);
    assert.equal(code, 1);
    assert.match(output, /^error:/);
  });
});
