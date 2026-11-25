'use strict';

/**
 * Refactored classification helpers with low cyclomatic and cognitive complexity.
 * Each helper has V(G) <= 4, well under the platform threshold of 10.
 */

function classifyRetailGold(units, value, expedited, region) {
  if (units > 100) {
    if (value > 10000) return expedited ? 'retail-gold-bulk-priority' : 'retail-gold-bulk';
    if (value > 1000) return region === 'emea' ? 'retail-gold-mid-emea' : 'retail-gold-mid';
    return 'retail-gold-small';
  }
  if (units > 10) return expedited && value > 500 ? 'retail-gold-priority' : 'retail-gold';
  return 'retail-gold-minimal';
}

function classifyRetailSilver(units, value, region) {
  if (units > 100) return value > 5000 ? 'retail-silver-bulk' : 'retail-silver-mid';
  if (units > 10) return region === 'apac' ? 'retail-silver-apac' : 'retail-silver';
  return 'retail-silver-minimal';
}

function classifyRetail(tier, units, value, expedited, region) {
  if (tier === 'gold') return classifyRetailGold(units, value, expedited, region);
  if (tier === 'silver') return classifyRetailSilver(units, value, region);
  return units > 50 ? 'retail-standard-bulk' : 'retail-standard';
}

function classifyWholesale(units, value, expedited, tier) {
  if (units > 500) return value > 50000
    ? (expedited ? 'wholesale-mega-priority' : 'wholesale-mega')
    : 'wholesale-bulk';
  if (units > 100) return tier === 'gold' ? 'wholesale-gold' : 'wholesale-mid';
  return 'wholesale-small';
}

function classifyPartner(units, region) {
  const isIntl = region === 'emea' || region === 'apac';
  if (isIntl) return units > 100 ? 'partner-intl-bulk' : 'partner-intl';
  return units > 100 ? 'partner-dom-bulk' : 'partner-dom';
}

function classifyOrder(channel, tier, units, value, expedited, region) {
  if (channel === 'retail') return classifyRetail(tier, units, value, expedited, region);
  if (channel === 'wholesale') return classifyWholesale(units, value, expedited, tier);
  return classifyPartner(units, region);
}

/** Fan-out fixture: calls many distinct collaborators from one function. */
function auditTrail(order) {
  return [
    stampIdentity(order.id),
    stampTier(order.tier),
    stampChecksum(order.id),
    stampTimestamp(),
    stampRegion('emea'),
  ];
}

function stampIdentity(id) { return `id:${id}`; }
function stampTier(tier) { return `tier:${tier}`; }
function stampChecksum(id) {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) {
    sum = (sum * 31 + id.charCodeAt(i)) % 99991;
  }
  return `sum:${sum}`;
}
function stampTimestamp() { return `ts:${new Date(0).toISOString()}`; }
function stampRegion(region) { return `region:${region}`; }

function isBulkTier(tier) {
  return tier === 'gold' || tier === 'silver';
}

function tierDiscount(tier) {
  if (tier === 'gold') return 0.15;
  if (tier === 'silver') return 0.1;
  return 0;
}

module.exports = { classifyOrder, auditTrail, isBulkTier, tierDiscount };

module.exports.regionSurcharge = function regionSurcharge(region) {
  if (region === 'emea') return 0.04;
  if (region === 'apac') return 0.06;
  return 0;
};

module.exports.expediteFee = function expediteFee(value, expedited) {
  return expedited ? Math.round(value * 0.02 * 100) / 100 : 0;
};
