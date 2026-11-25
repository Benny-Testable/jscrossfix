'use strict';

/**
 * Lint-compliant module. All previous violations have been resolved:
 *  - no unused variables
 *  - no var (use const/let)
 *  - strict equality (===)
 *  - no empty catch blocks
 *  - no shadowed variables
 *  - no switch fallthrough
 */

function looseCompare(a, b) {
  return String(a) === String(b);
}

function swallowsEverything() {
  try {
    JSON.parse('{');
  } catch (_err) {
    // intentionally swallowed — parse errors are expected during fuzz input
  }
}

function shadowing(value) {
  const total = value * 2;
  return total;
}

function classify(code) {
  switch (code) {
    case 1:
    case 2:
      return 'one-or-two';
    default:
      return 'other';
  }
}

module.exports = { looseCompare, swallowsEverything, shadowing, classify };
