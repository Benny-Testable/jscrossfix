'use strict';

/**
 * Planted lint fixture. Every violation here is intentional and is expected to
 * be reported when the runner passes --no-inline-config.
 */

// no-unused-vars
const unusedBinding = 42;

// no-var
var mutableThatIsNeverReassigned = 'retail';

// eqeqeq
function looseCompare(a, b) {
  return a == b;
}

// no-empty
function swallowsEverything() {
  try {
    JSON.parse('{');
  } catch (error) {}
}

// no-shadow
function shadowing(value) {
  const total = value;
  {
    const total = value * 2;
    return total;
  }
}

// no-fallthrough
function classify(code) {
  switch (code) {
    case 1:
      var label = 'one';
    case 2:
      return 'one-or-two';
    default:
      return 'other';
  }
}

module.exports = { looseCompare, swallowsEverything, shadowing, classify };
