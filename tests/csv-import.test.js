'use strict';

const assert = require('node:assert/strict');
const { parseLine, parseCsv, importMembers } = require('../src/csv-import');
const { MemberRegistry } = require('../src/members');

describe('csv import', () => {
  it('parses plain and quoted cells', () => {
    assert.deepEqual(parseLine('a, b ,c'), ['a', 'b', 'c']);
    assert.deepEqual(parseLine('"Silva, Ana",x,"say ""hi"""'), ['Silva, Ana', 'x', 'say "hi"']);
  });

  it('parses a table with a header', () => {
    const rows = parseCsv('Name,Email\nAna Silva,ana@example.com\nBen Okafor,ben@example.com');
    assert.equal(rows.length, 2);
    assert.equal(rows[1].email, 'ben@example.com');
  });

  it('rejects ragged lines', () => {
    assert.throws(() => parseCsv('a,b\n1'), /line 2/);
  });

  it('imports valid members and reports bad ones', () => {
    const registry = new MemberRegistry();
    const text = 'name,email,tier\nAna Silva,ana@example.com,senior\nBad Person,not-an-email,standard';
    const result = importMembers(text, registry);
    assert.equal(result.imported.length, 1);
    assert.equal(result.rejected.length, 1);
    assert.equal(result.rejected[0].line, 3);
    assert.equal(registry.get('m1').tier, 'senior');
  });

  it('reports a malformed file as one rejection', () => {
    const result = importMembers('a,b\n1', new MemberRegistry());
    assert.equal(result.imported.length, 0);
    assert.equal(result.rejected[0].line, 0);
  });
});
