'use strict';

// Second half of the planted circular require.
const cycleA = require('./cycle-a');

function cycleBName() {
  return 'cycle-b<' + cycleA.cycleAName;
}

module.exports = { cycleBName };
