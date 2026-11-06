'use strict';

const assert = require('node:assert/strict');
const garden = require('../src');

describe('public api', () => {
  it('exposes the main building blocks', () => {
    for (const name of ['MemberRegistry', 'ReservationBook', 'Waitlist', 'ToolInventory', 'JsonStore', 'quoteSeasonFee']) {
      assert.ok(garden[name], `${name} is exported`);
    }
  });
});
