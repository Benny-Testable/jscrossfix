'use strict';

const assert = require('node:assert/strict');
const { loadConfig, assertDataVersion, DEFAULTS } = require('../src/config');
const { GardenError } = require('../src/errors');

describe('config', () => {
  it('returns defaults without overrides', () => {
    assert.equal(loadConfig().clubName, DEFAULTS.clubName);
    assert.equal(loadConfig({}).seasonStartMonth, 3);
  });

  it('applies environment overrides', () => {
    const config = loadConfig({ GARDEN_CLUB_NAME: 'Hilltop', GARDEN_SUPPORT_EMAIL: 'x@example.org', GARDEN_SEASON_START: '4' });
    assert.equal(config.clubName, 'Hilltop');
    assert.equal(config.supportEmail, 'x@example.org');
    assert.equal(config.seasonStartMonth, 4);
  });

  it('rejects an invalid season month', () => {
    assert.throws(() => loadConfig({ GARDEN_SEASON_START: '13' }), GardenError);
  });

  it('compares data versions', () => {
    assert.equal(assertDataVersion('2.3.0'), 'current');
    assert.equal(assertDataVersion('2.1.5'), 'migrate');
    assert.throws(() => assertDataVersion('1.9.0'), /not compatible/);
    assert.throws(() => assertDataVersion('latest'), /invalid/);
  });
});
