'use strict';

const assert = require('node:assert/strict');
const { formatReminder, buildMessages, sendAll } = require('../src/notifications');
const { MemberRegistry } = require('../src/members');

const member = { name: 'Ana Silva', email: 'ana@example.com' };

describe('notifications', () => {
  it('words reminders by severity', () => {
    assert.match(formatReminder(member, { toolId: 't1', days: 2, severity: 'notice' }), /friendly reminder/);
    assert.match(formatReminder(member, { toolId: 't1', days: 9, severity: 'warning' }), /return it this week/);
    assert.match(formatReminder(member, { toolId: 't1', days: 20, severity: 'suspend' }), /suspended/);
  });

  it('builds messages for active members only', () => {
    const registry = new MemberRegistry();
    registry.register({ name: 'Ana Silva', email: 'ana@example.com' });
    registry.register({ name: 'Ben Okafor', email: 'ben@example.com' });
    registry.deactivate('m2');
    const messages = buildMessages(
      [
        { toolId: 't1', memberId: 'm1', days: 3, severity: 'notice' },
        { toolId: 't2', memberId: 'm2', days: 3, severity: 'notice' },
        { toolId: 't3', memberId: 'm9', days: 3, severity: 'notice' },
      ],
      registry,
    );
    assert.equal(messages.length, 1);
    assert.equal(messages[0].to, 'ana@example.com');
  });

  it('retries failed deliveries', async () => {
    let calls = 0;
    const transport = async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error('timeout');
      }
    };
    const report = await sendAll([{ to: 'a@example.com' }], transport);
    assert.equal(report.sent, 1);
    assert.equal(calls, 2);
  });

  it('records permanent failures', async () => {
    const transport = async () => {
      throw new Error('mailbox full');
    };
    const report = await sendAll([{ to: 'a@example.com' }, { to: 'b@example.com' }], transport, 1);
    assert.equal(report.sent, 0);
    assert.deepEqual(report.failed.map((f) => f.reason), ['mailbox full', 'mailbox full']);
  });
});
