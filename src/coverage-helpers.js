'use strict';

/**
 * Coverage helper module — simple pure functions designed so the
 * companion tests cover every statement, branch and def-use pair.
 */

function sumArray(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

function processItems(items) {
  const results = [];
  for (const item of items) {
    if (item > 0) {
      results.push(item * 2);
    } else {
      results.push(0);
    }
  }
  return results;
}

function repeatAction(count, action) {
  let executed = 0;
  while (executed < count) {
    action(executed);
    executed++;
  }
  return executed;
}

function findFirst(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) return arr[i];
  }
  return null;
}

function safeParseInt(value) {
  if (value === null || value === undefined) return 0;
  if (value === '') return 0;
  const n = parseInt(value, 10);
  return isNaN(n) ? 0 : n;
}

function clamp(value, min, max) {
  if (value === null || value === undefined) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function safeDivide(a, b) {
  if (b === 0 || b === null || b === undefined) return null;
  return a / b;
}

function trimOrNull(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

function mergeDefaults(target, defaults) {
  if (target === null || target === undefined) return Object.assign({}, defaults);
  return Object.assign({}, defaults, target);
}

function computeDiscount(user) {
  let rate = 0;
  if (user === null || user === undefined) return rate;
  if (user.premium) {
    rate = 0.2;
  }
  if (user.loyaltyYears > 5) {
    rate += 0.05;
  }
  if (user.referral) {
    rate += 0.03;
  }
  return rate;
}

module.exports = {
  sumArray, processItems, repeatAction, findFirst,
  safeParseInt, clamp, safeDivide, trimOrNull, mergeDefaults, computeDiscount,
};
