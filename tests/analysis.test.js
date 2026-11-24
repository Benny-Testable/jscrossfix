'use strict';

const assert = require('node:assert/strict');
const { classifyOrder, auditTrail, isBulkTier, tierDiscount } = require('../src/analysis/complexity-sample');
const { intakeOrder, reconcile } = require('../src/analysis/call-graph-sample');
const { settleLegacyInvoice, unreachableAfterReturn, LEGACY_TAX_TABLE } = require('../src/analysis/dead-code');
const { looseCompare, swallowsEverything, shadowing, classify } = require('../src/analysis/lint-violations');
const { matchSku, lookupRate, checkSecret } = require('../src/analysis/sast-fixture');
const { maskPii, authorize, purgeExportAuthorized, legacyDigest, sameToken, renderBanner, insecureAgentOptions } =
  require('../src/analysis/sensitive-data-fixture');
const { describeCycleA } = require('../src/analysis/cycle-a');
const { cycleBName } = require('../src/analysis/cycle-b');
const { databasePassword, legacyConfig } = require('../src/analysis/secrets-fixture');
const { studentContactLine, SEED_STUDENTS } = require('../src/analysis/student-pii-fixture');

// These specs run the planted analysis fixtures with real inputs, so every tool that
// measures execution (path, branch, condition, data-flow, mutation) has a trace to read.
// Only pure functions are called. Fixture functions that run a shell command, evaluate
// code or touch the file system are deliberately left alone.

describe('analysis fixtures: classifyOrder branches', () => {
  const cases = [
    [['retail', 'gold', 200, 20000, true, 'us'], 'retail-gold-bulk-priority'],
    [['retail', 'gold', 200, 20000, false, 'us'], 'retail-gold-bulk'],
    [['retail', 'gold', 200, 2000, false, 'emea'], 'retail-gold-mid-emea'],
    [['retail', 'gold', 200, 2000, false, 'us'], 'retail-gold-mid'],
    [['retail', 'gold', 200, 100, false, 'us'], 'retail-gold-small'],
    [['retail', 'gold', 50, 900, true, 'us'], 'retail-gold-priority'],
    [['retail', 'gold', 50, 900, false, 'us'], 'retail-gold'],
    [['retail', 'gold', 5, 100, false, 'us'], 'retail-gold-minimal'],
    [['retail', 'silver', 200, 6000, false, 'us'], 'retail-silver-bulk'],
    [['retail', 'silver', 200, 4000, false, 'us'], 'retail-silver-mid'],
    [['retail', 'silver', 50, 100, false, 'apac'], 'retail-silver-apac'],
    [['retail', 'silver', 50, 100, false, 'us'], 'retail-silver'],
    [['retail', 'silver', 5, 100, false, 'us'], 'retail-silver-minimal'],
    [['retail', 'bronze', 80, 100, false, 'us'], 'retail-standard-bulk'],
    [['retail', 'bronze', 20, 100, false, 'us'], 'retail-standard'],
    [['wholesale', 'gold', 600, 60000, true, 'us'], 'wholesale-mega-priority'],
    [['wholesale', 'gold', 600, 60000, false, 'us'], 'wholesale-mega'],
    [['wholesale', 'gold', 600, 100, false, 'us'], 'wholesale-bulk'],
    [['wholesale', 'gold', 200, 100, false, 'us'], 'wholesale-gold'],
    [['wholesale', 'silver', 200, 100, false, 'us'], 'wholesale-mid'],
    [['wholesale', 'silver', 20, 100, false, 'us'], 'wholesale-small'],
    [['partner', 'gold', 200, 100, false, 'emea'], 'partner-intl-bulk'],
    [['partner', 'gold', 20, 100, false, 'apac'], 'partner-intl'],
    [['partner', 'gold', 200, 100, false, 'us'], 'partner-dom-bulk'],
    [['partner', 'gold', 20, 100, false, 'us'], 'partner-dom'],
  ];

  for (const [args, bucket] of cases) {
    it(`classifies ${args.join(' / ')} as ${bucket}`, () => {
      assert.equal(classifyOrder(...args), bucket);
    });
  }

  it('keeps the thresholds exclusive at the boundaries', () => {
    assert.equal(classifyOrder('retail', 'gold', 100, 100, false, 'us'), 'retail-gold');
    assert.equal(classifyOrder('retail', 'gold', 10, 100, false, 'us'), 'retail-gold-minimal');
    assert.equal(classifyOrder('wholesale', 'gold', 500, 100, false, 'us'), 'wholesale-gold');
    assert.equal(classifyOrder('wholesale', 'gold', 100, 100, false, 'us'), 'wholesale-small');
  });
});

describe('analysis fixtures: audit trail and call graph', () => {
  it('builds a five entry audit trail', () => {
    assert.deepEqual(auditTrail({ id: 'A1', tier: 'gold' }), [
      'id:A1',
      'tier:gold',
      'sum:2064',
      'ts:1970-01-01T00:00:00.000Z',
      'region:emea',
    ]);
  });

  it('walks the five level call chain', () => {
    assert.equal(intakeOrder('  ab '), 'AB:2211');
  });

  it('reconciles an amount through six collaborators', () => {
    assert.deepEqual(reconcile(100), { net: 100, fee: 1.9, levy: 0.4, rebate: 0.25, rounding: 0, reference: 'REC-54993' });
    assert.deepEqual(reconcile(250.5), { net: 250.5, fee: 4.76, levy: 1, rebate: 0.63, rounding: 0.5, reference: 'REC-57940' });
  });
});

describe('analysis fixtures: tiers', () => {
  it('treats gold and silver as bulk tiers', () => {
    assert.equal(isBulkTier('gold'), true);
    assert.equal(isBulkTier('silver'), true);
    assert.equal(isBulkTier('bronze'), false);
  });

  it('returns the discount per tier', () => {
    assert.equal(tierDiscount('gold'), 0.15);
    assert.equal(tierDiscount('silver'), 0.1);
    assert.equal(tierDiscount('bronze'), 0);
  });
});

describe('analysis fixtures: dead code and lint fixtures', () => {
  it('settles a legacy invoice per channel', () => {
    assert.equal(settleLegacyInvoice(100, 'retail'), 107);
    assert.equal(settleLegacyInvoice(100, 'wholesale'), 105);
    assert.equal(LEGACY_TAX_TABLE['legacy-retail'], 0.07);
  });

  it('returns the value for a positive input and zero otherwise', () => {
    assert.equal(unreachableAfterReturn(5), 5);
    assert.equal(unreachableAfterReturn(0), 0);
    assert.equal(unreachableAfterReturn(-3), 0);
  });

  it('compares loosely', () => {
    assert.equal(looseCompare(1, '1'), true);
    assert.equal(looseCompare(1, 2), false);
  });

  it('swallows a parse error without throwing', () => {
    assert.doesNotThrow(() => swallowsEverything());
  });

  it('returns the shadowed value', () => {
    assert.equal(shadowing(4), 8);
  });

  it('falls through from case one to case two', () => {
    assert.equal(classify(1), 'one-or-two');
    assert.equal(classify(2), 'one-or-two');
    assert.equal(classify(9), 'other');
  });
});

describe('analysis fixtures: pure helpers of the SAST fixture', () => {
  it('matches a SKU pattern', () => {
    assert.equal(matchSku('^SKU-[0-9]+$', 'SKU-42'), true);
    assert.equal(matchSku('^SKU-[0-9]+$', 'ABC-42'), false);
  });

  it('looks up a rate and returns undefined for a missing key', () => {
    assert.equal(lookupRate({ gold: 0.15 }, 'gold'), 0.15);
    assert.equal(lookupRate({ gold: 0.15 }, 'none'), undefined);
  });

  it('compares secrets by equality', () => {
    assert.equal(checkSecret('a', 'a'), true);
    assert.equal(checkSecret('a', 'b'), false);
  });
});

describe('analysis fixtures: sensitive data helpers', () => {
  it('masks all but the last two characters', () => {
    assert.equal(maskPii('abcdef'), '****ef');
  });

  it('allows an admin and rejects any other role', () => {
    assert.doesNotThrow(() => authorize('admin'));
    assert.throws(() => authorize('guest'), /forbidden/);
    assert.throws(() => purgeExportAuthorized('guest', 'none.txt'), /forbidden/);
  });

  it('hashes with md5', () => {
    assert.equal(legacyDigest('a'), '0cc175b9c0f1b6a831c399e269772661');
  });

  it('compares two tokens', () => {
    assert.equal(sameToken('x', 'x'), true);
    assert.equal(sameToken('x', 'y'), false);
  });

  it('writes a banner into an element', () => {
    const element = { innerHTML: '' };
    renderBanner(element, 'hello');
    assert.equal(element.innerHTML, 'hello');
    assert.equal(insecureAgentOptions.keepAlive, true);
  });
});

describe('analysis fixtures: cycle, secret and student constants', () => {
  it('walks the two-module cycle', () => {
    assert.equal(describeCycleA(), 'cycle-a>cycle-b<cycle-a');
    assert.equal(cycleBName(), 'cycle-b<cycle-a');
  });

  it('exposes the fake credentials', () => {
    assert.ok(databasePassword.length > 10);
    assert.ok(legacyConfig.password.length > 10);
  });

  it('formats a student contact line', () => {
    assert.equal(SEED_STUDENTS.length, 2);
    assert.match(studentContactLine(SEED_STUDENTS[0]), /Jennifer Alvarez/);
  });
});
