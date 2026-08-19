'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { JsonStore } = require('../src/storage');
const { newId, hasPrefix } = require('../src/ids');
const { GardenError } = require('../src/errors');

describe('JsonStore', () => {
  let dir;
  let store;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'granite-'));
    store = new JsonStore(path.join(dir, 'data'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('round trips data', () => {
    store.save('plots', { count: 2, names: ['a', 'b'] });
    assert.deepEqual(store.load('plots'), { count: 2, names: ['a', 'b'] });
  });

  it('returns the fallback for a missing collection', () => {
    assert.deepEqual(store.load('missing', []), []);
    assert.throws(() => store.load('missing'), /ENOENT/);
  });

  it('lists saved collections', () => {
    assert.deepEqual(store.list(), []);
    store.save('members', []);
    store.save('plots', []);
    assert.deepEqual(store.list(), ['members', 'plots']);
  });

  it('reports corrupt files', () => {
    store.save('plots', {});
    fs.writeFileSync(store.fileFor('plots'), '{oops');
    assert.throws(() => store.load('plots'), GardenError);
  });

  it('removes files', () => {
    store.save('plots', {});
    assert.equal(store.remove('plots'), true);
    assert.equal(store.remove('plots'), false);
  });

  it('summarizes selected keys', () => {
    store.save('club', { name: 'Granite', founded: 1998, secret: 'x' });
    assert.deepEqual(store.summarize('club', ['name', 'founded']), { name: 'Granite', founded: 1998 });
  });
});

describe('ids', () => {
  it('creates prefixed ids', () => {
    const id = newId('plot');
    assert.equal(hasPrefix(id, 'plot'), true);
    assert.equal(hasPrefix(id, 'member'), false);
    assert.notEqual(newId('plot'), id);
  });
});
