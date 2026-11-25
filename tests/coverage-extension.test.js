'use strict';

/**
 * Extended coverage tests — imports from src/coverage-helpers.js so that
 * nyc/c8 path coverage, loop coverage and def-use tracking are attributed
 * to the production module, not the test file.
 */

const assert = require('node:assert/strict');
const {
  sumArray, processItems, repeatAction, findFirst,
  safeParseInt, clamp, safeDivide, trimOrNull, mergeDefaults, computeDiscount,
} = require('../src/coverage-helpers');

describe('loop coverage: zero iterations', () => {
  it('sumArray on empty array returns 0', () => { assert.equal(sumArray([]), 0); });
  it('processItems on empty returns []', () => { assert.deepEqual(processItems([]), []); });
  it('repeatAction with 0 executes 0 times', () => {
    let calls = 0;
    assert.equal(repeatAction(0, () => { calls++; }), 0);
    assert.equal(calls, 0);
  });
  it('findFirst on empty returns null', () => { assert.equal(findFirst([], x => x > 0), null); });
});

describe('loop coverage: exactly one iteration', () => {
  it('sumArray single element', () => { assert.equal(sumArray([42]), 42); });
  it('processItems single positive', () => { assert.deepEqual(processItems([5]), [10]); });
  it('processItems single negative', () => { assert.deepEqual(processItems([-3]), [0]); });
  it('repeatAction with 1', () => {
    let calls = 0;
    repeatAction(1, () => { calls++; });
    assert.equal(calls, 1);
  });
  it('findFirst finds only element', () => { assert.equal(findFirst([7], x => x > 0), 7); });
  it('findFirst misses only element', () => { assert.equal(findFirst([-1], x => x > 0), null); });
});

describe('loop coverage: many iterations', () => {
  it('sumArray many elements', () => { assert.equal(sumArray([1,2,3,4,5,6,7,8,9,10]), 55); });
  it('processItems mixed', () => { assert.deepEqual(processItems([1,-1,2,-2,3]), [2,0,4,0,6]); });
  it('repeatAction many', () => {
    const seen = [];
    repeatAction(5, i => seen.push(i));
    assert.deepEqual(seen, [0,1,2,3,4]);
  });
  it('findFirst locates correct element', () => {
    assert.equal(findFirst([0,-5,0,3,7], x => x > 2), 3);
  });
});

describe('safeParseInt boundary coverage', () => {
  it('null returns 0', () => { assert.equal(safeParseInt(null), 0); });
  it('undefined returns 0', () => { assert.equal(safeParseInt(undefined), 0); });
  it('empty string returns 0', () => { assert.equal(safeParseInt(''), 0); });
  it('non-numeric returns 0', () => { assert.equal(safeParseInt('abc'), 0); });
  it('valid int', () => { assert.equal(safeParseInt('42'), 42); });
  it('negative int', () => { assert.equal(safeParseInt('-7'), -7); });
  it('truncates float', () => { assert.equal(safeParseInt('3.9'), 3); });
  it('zero string', () => { assert.equal(safeParseInt('0'), 0); });
});

describe('clamp boundary coverage', () => {
  it('null returns min', () => { assert.equal(clamp(null, 0, 100), 0); });
  it('undefined returns min', () => { assert.equal(clamp(undefined, 5, 10), 5); });
  it('below min', () => { assert.equal(clamp(-5, 0, 100), 0); });
  it('above max', () => { assert.equal(clamp(150, 0, 100), 100); });
  it('within range', () => { assert.equal(clamp(50, 0, 100), 50); });
  it('exact min', () => { assert.equal(clamp(0, 0, 100), 0); });
  it('exact max', () => { assert.equal(clamp(100, 0, 100), 100); });
  it('min equals max', () => { assert.equal(clamp(50, 10, 10), 10); });
});

describe('safeDivide boundary coverage', () => {
  it('zero divisor returns null', () => { assert.equal(safeDivide(10, 0), null); });
  it('null divisor returns null', () => { assert.equal(safeDivide(10, null), null); });
  it('undefined divisor returns null', () => { assert.equal(safeDivide(10, undefined), null); });
  it('positive division', () => { assert.equal(safeDivide(10, 2), 5); });
  it('negative divisor', () => { assert.equal(safeDivide(10, -2), -5); });
  it('zero numerator', () => { assert.equal(safeDivide(0, 5), 0); });
});

describe('trimOrNull boundary coverage', () => {
  it('null returns null', () => { assert.equal(trimOrNull(null), null); });
  it('undefined returns null', () => { assert.equal(trimOrNull(undefined), null); });
  it('number returns null', () => { assert.equal(trimOrNull(42), null); });
  it('whitespace-only returns null', () => { assert.equal(trimOrNull('   '), null); });
  it('empty string returns null', () => { assert.equal(trimOrNull(''), null); });
  it('trims and returns', () => { assert.equal(trimOrNull('  hello  '), 'hello'); });
  it('preserves inner whitespace', () => { assert.equal(trimOrNull('a b'), 'a b'); });
});

describe('mergeDefaults coverage', () => {
  it('null target returns defaults copy', () => {
    assert.deepEqual(mergeDefaults(null, { a: 1 }), { a: 1 });
  });
  it('undefined target returns defaults copy', () => {
    assert.deepEqual(mergeDefaults(undefined, { b: 2 }), { b: 2 });
  });
  it('overrides defaults', () => {
    assert.deepEqual(mergeDefaults({ a: 10 }, { a: 1, b: 2 }), { a: 10, b: 2 });
  });
  it('no overlap merges cleanly', () => {
    assert.deepEqual(mergeDefaults({ c: 3 }, { a: 1, b: 2 }), { a: 1, b: 2, c: 3 });
  });
});

describe('computeDiscount def-use coverage', () => {
  it('null user', () => { assert.equal(computeDiscount(null), 0); });
  it('undefined user', () => { assert.equal(computeDiscount(undefined), 0); });
  it('no flags', () => {
    assert.equal(computeDiscount({ premium: false, loyaltyYears: 1, referral: false }), 0);
  });
  it('premium only', () => {
    assert.equal(computeDiscount({ premium: true, loyaltyYears: 1, referral: false }), 0.2);
  });
  it('loyalty > 5 only', () => {
    assert.equal(computeDiscount({ premium: false, loyaltyYears: 10, referral: false }), 0.05);
  });
  it('referral only', () => {
    assert.equal(computeDiscount({ premium: false, loyaltyYears: 1, referral: true }), 0.03);
  });
  it('premium + loyalty', () => {
    assert.equal(computeDiscount({ premium: true, loyaltyYears: 10, referral: false }), 0.25);
  });
  it('all three flags', () => {
    assert.equal(computeDiscount({ premium: true, loyaltyYears: 10, referral: true }), 0.28);
  });
  it('loyalty boundary at 5 (not > 5)', () => {
    assert.equal(computeDiscount({ premium: false, loyaltyYears: 5, referral: false }), 0);
  });
  it('loyalty boundary at 6 (> 5)', () => {
    assert.equal(computeDiscount({ premium: false, loyaltyYears: 6, referral: false }), 0.05);
  });
});

const { tallyHours } = require('../src/dataflow');
const { LegacyHttpError, legacyNotFound, legacyBadRequest, legacyForbidden } = require('../src/http-errors-legacy');
const { orphanedHelper } = require('../src/analysis/dead-code');

describe('dataflow tallyHours coverage', () => {
  it('handles empty records', () => {
    assert.deepEqual(tallyHours([]), { total: 0, bands: { low: 0, mid: 0, high: 0, invalid: 0 } });
  });
  it('categorizes low, mid, high, capped, and invalid records', () => {
    const res = tallyHours([
      { hours: -1 },
      { hours: 'bad' },
      null,
      { hours: 2 },
      { hours: 5 },
      { hours: 10 },
      { hours: 12 },
    ], 8);
    assert.deepEqual(res, { total: 23, bands: { low: 2, mid: 1, high: 2, invalid: 2 } });
  });
});

describe('http-errors-legacy coverage', () => {
  it('creates legacy error instances with default and custom messages', () => {
    assert.equal(new LegacyHttpError(418, 'teapot').status, 418);
    assert.equal(legacyNotFound().status, 404);
    assert.equal(legacyNotFound('missing').message, 'missing');
    assert.equal(legacyBadRequest().status, 400);
    assert.equal(legacyBadRequest('invalid').message, 'invalid');
    assert.equal(legacyForbidden().status, 403);
    assert.equal(legacyForbidden('denied').message, 'denied');
  });
});

describe('dead-code orphanedHelper coverage', () => {
  it('trims and lowercases input', () => {
    assert.equal(orphanedHelper('  HeLLo  '), 'hello');
  });
});
