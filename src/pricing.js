'use strict';

const { ValidationError } = require('./errors');

const BASE_RATE = { small: 40, medium: 65, large: 95 };
const TIER_DISCOUNT = { standard: 0, student: 0.15, family: 0.1, senior: 0.2 };
const WATER_ADDON = 12;
const FEE_CAP = 150;

function sizeClass(squareMetres) {
  if (!(squareMetres > 0)) {
    throw new ValidationError('area', 'must be positive');
  }
  if (squareMetres <= 10) {
    return 'small';
  }
  if (squareMetres <= 25) {
    return 'medium';
  }
  return 'large';
}

function ageOf(birthYear, now) {
  const year = (now || new Date()).getUTCFullYear();
  return year - birthYear;
}

function quoteSeasonFee(member, plotArea, options) {
  const opts = options || {};
  let fee = BASE_RATE[sizeClass(plotArea)];
  let discount = TIER_DISCOUNT[member.tier] || 0;

  if (member.birthYear !== undefined) {
    const age = ageOf(member.birthYear, opts.now);
    if (age >= 65 && discount < TIER_DISCOUNT.senior) {
      discount = TIER_DISCOUNT.senior;
    } else if (age < 18) {
      discount = Math.max(discount, 0.5);
    }
  }
  if (opts.earlyBird) {
    if (opts.plotCount && opts.plotCount > 1) {
      discount += 0.02;
    } else {
      discount += 0.05;
    }
  }
  fee = fee * (1 - discount);
  if (opts.plotCount > 1) {
    fee += (opts.plotCount - 1) * 10;
  }
  if (opts.water) {
    fee += WATER_ADDON;
  }
  return Math.min(Math.round(fee * 100) / 100, FEE_CAP);
}

function applyLateFee(amount, daysLate) {
  if (daysLate <= 0) {
    return amount;
  }
  let total = amount;
  for (let day = 1; day <= daysLate; day += 1) {
    total += day <= 7 ? 0.5 : 1;
  }
  return Math.round(total * 100) / 100;
}

function splitInstallments(total, count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new ValidationError('count', 'must be a positive integer');
  }
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / count);
  const remainder = cents - base * count;
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    parts.push((base + (i < remainder ? 1 : 0)) / 100);
  }
  return parts;
}

module.exports = { BASE_RATE, FEE_CAP, sizeClass, ageOf, quoteSeasonFee, applyLateFee, splitInstallments };
