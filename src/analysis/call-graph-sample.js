'use strict';

/**
 * Planted call-graph fixture for madge and dependency-cruiser.
 *
 * Deliberate shape: one entry point with a call depth of 5, and one function
 * with a fan-out of 6. Depth and fan-out are the two structural numbers the
 * graph tools are assigned to produce.
 */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** depth 1 */
function intakeOrder(id) {
  return normaliseOrder(id);
}
/** depth 2 */
function normaliseOrder(id) {
  return enrichOrder(id.trim());
}
/** depth 3 */
function enrichOrder(id) {
  return scoreOrder(id.toUpperCase());
}
/** depth 4 */
function scoreOrder(id) {
  return persistOrder(id + ':' + String(checksum(id)));
}
/** depth 5 */
function persistOrder(record) {
  return record;
}

function checksum(value) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) {
    total = (total * 33 + value.charCodeAt(i)) % 65521;
  }
  return total;
}

/** fan-out of 6: calls six distinct collaborators. */
function reconcile(amount) {
  return {
    net: round2(amount),
    fee: computeFee(amount),
    levy: computeLevy(amount),
    rebate: computeRebate(amount),
    rounding: computeRounding(amount),
    reference: buildReference(amount),
  };
}

function computeFee(amount) { return round2(amount * 0.019); }
function computeLevy(amount) { return round2(amount * 0.004); }
function computeRebate(amount) { return round2(amount * 0.0025); }
function computeRounding(amount) { return round2(Math.ceil(amount) - amount); }
function buildReference(amount) { return 'REC-' + String(checksum(String(amount))); }

module.exports = { intakeOrder, reconcile };
