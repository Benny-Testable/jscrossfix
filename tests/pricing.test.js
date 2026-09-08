'use strict';

const assert = require('node:assert/strict');
const pricing = require('../src/pricing');

const NOW = new Date('2026-03-01T00:00:00Z');

describe('pricing', () => {
  it('classifies plot sizes', () => {
    assert.equal(pricing.sizeClass(10), 'small');
    assert.equal(pricing.sizeClass(25), 'medium');
    assert.equal(pricing.sizeClass(26), 'large');
    assert.throws(() => pricing.sizeClass(0), /area/);
  });

  it('quotes a standard member', () => {
    assert.equal(pricing.quoteSeasonFee({ tier: 'standard' }, 12), 65);
  });

  it('applies tier discounts', () => {
    assert.equal(pricing.quoteSeasonFee({ tier: 'student' }, 12), 55.25);
  });

  it('gives youth members half price', () => {
    const fee = pricing.quoteSeasonFee({ tier: 'standard', birthYear: 2015 }, 5, { now: NOW });
    assert.equal(fee, 20);
  });

  it('gives seniors a discount', () => {
    const fee = pricing.quoteSeasonFee({ tier: 'standard', birthYear: 1950 }, 12, { now: NOW });
    assert.equal(fee, 52);
  });

  it('treats a member who turns 65 this year as a senior', () => {
    const turning65 = pricing.quoteSeasonFee({ tier: 'standard', birthYear: 1961 }, 12, { now: NOW });
    const almost = pricing.quoteSeasonFee({ tier: 'standard', birthYear: 1962 }, 12, { now: NOW });
    assert.equal(turning65, 52);
    assert.equal(almost, 65);
  });

  it('adds extras and honours the cap', () => {
    assert.equal(pricing.quoteSeasonFee({ tier: 'standard' }, 12, { water: true, earlyBird: true }), 73.75);
    assert.equal(pricing.quoteSeasonFee({ tier: 'standard' }, 12, { plotCount: 3, earlyBird: true }), 83.7);
    assert.equal(pricing.quoteSeasonFee({ tier: 'standard' }, 40, { plotCount: 9, water: true }), pricing.FEE_CAP);
  });

  it('computes late fees', () => {
    assert.equal(pricing.applyLateFee(50, 0), 50);
    assert.equal(pricing.applyLateFee(50, 3), 51.5);
    assert.equal(pricing.applyLateFee(50, 10), 56.5);
  });

  it('splits installments without losing cents', () => {
    const parts = pricing.splitInstallments(100, 3);
    assert.deepEqual(parts, [33.34, 33.33, 33.33]);
    assert.throws(() => pricing.splitInstallments(10, 0), /count/);
  });
});
