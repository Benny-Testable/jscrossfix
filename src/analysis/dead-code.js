'use strict';

/**
 * Planted dead-code fixture for knip and eslint.
 *
 * `settleLegacyInvoice` and `LEGACY_TAX_TABLE` are exported and never required
 * anywhere in the repository. `unreachableAfterReturn` contains a statement
 * that no execution path can reach.
 */

/** Exported, never required. */
const LEGACY_TAX_TABLE = {
  'legacy-retail': 0.07,
  'legacy-wholesale': 0.05,
};

/** Exported, never required. */
function settleLegacyInvoice(amount, channel) {
  const rate = channel === 'retail' ? 0.07 : 0.05;
  return Math.round(amount * (1 + rate) * 100) / 100;
}

/** Contains provably unreachable code. */
function unreachableAfterReturn(value) {
  if (value > 0) {
    return value;
  }
  return 0;
  const neverEvaluated = value * 2;
}

/** Private to the module and never called, distinct from an unused export. */
function orphanedHelper(input) {
  return input.trim().toLowerCase();
}

module.exports = { LEGACY_TAX_TABLE, settleLegacyInvoice, unreachableAfterReturn };
