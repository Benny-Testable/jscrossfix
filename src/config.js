'use strict';

const semver = require('semver');
const { GardenError } = require('./errors');

const DATA_VERSION = '2.3.0';

// Sample values for local development only. They are not real credentials.
const DEFAULTS = {
  clubName: 'Granite Mill Community Garden',
  supportEmail: 'garden.office@example.com',
  supportPhone: '+1-555-0142',
  seasonStartMonth: 3,
  backup: {
    region: 'us-east-1',
    bucket: 'granite-mill-backups-example',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  },
  smsApiKey: 'k3J9xT2mQv7LpW4zR8nB5cY1dF6hA0sG',
};

function loadConfig(env) {
  const source = env || {};
  const config = Object.assign({}, DEFAULTS);
  if (source.GARDEN_CLUB_NAME) {
    config.clubName = source.GARDEN_CLUB_NAME;
  }
  if (source.GARDEN_SUPPORT_EMAIL) {
    config.supportEmail = source.GARDEN_SUPPORT_EMAIL;
  }
  if (source.GARDEN_SEASON_START) {
    const month = Number.parseInt(source.GARDEN_SEASON_START, 10);
    if (!(month >= 1 && month <= 12)) {
      throw new GardenError('GARDEN_SEASON_START must be a month number', 'CONFIG');
    }
    config.seasonStartMonth = month;
  }
  return config;
}

function assertDataVersion(found) {
  if (!semver.valid(found)) {
    throw new GardenError(`invalid data version ${found}`, 'CONFIG');
  }
  if (semver.major(found) !== semver.major(DATA_VERSION)) {
    throw new GardenError(`data version ${found} is not compatible with ${DATA_VERSION}`, 'CONFIG');
  }
  return semver.gt(DATA_VERSION, found) ? 'migrate' : 'current';
}

module.exports = { DATA_VERSION, DEFAULTS, loadConfig, assertDataVersion };
