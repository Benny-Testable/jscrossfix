'use strict';

// Planted circular require for madge and dependency-cruiser.
// cycle-a requires cycle-b and cycle-b requires cycle-a. The name is exported first, on the
// same exports object, so cycle-b sees it even though cycle-a is still loading.
exports.cycleAName = 'cycle-a';

const cycleB = require('./cycle-b');

exports.describeCycleA = function describeCycleA() {
  return exports.cycleAName + '>' + cycleB.cycleBName();
};
