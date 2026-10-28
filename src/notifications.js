'use strict';

const { DEFAULTS } = require('./config');

const SAMPLE_CONTACT = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '555-010-0199',
};

function formatReminder(member, late, config) {
  const cfg = config || DEFAULTS;
  const lines = [`Hello ${member.name},`];
  if (late.severity === 'suspend') {
    lines.push(`Your loan of ${late.toolId} is ${late.days} days overdue and borrowing is suspended.`);
  } else if (late.severity === 'warning') {
    lines.push(`Your loan of ${late.toolId} is ${late.days} days overdue. Please return it this week.`);
  } else {
    lines.push(`A friendly reminder: ${late.toolId} was due ${late.days} day(s) ago.`);
  }
  lines.push(`Questions? Write to ${cfg.supportEmail} or call ${cfg.supportPhone}.`);
  return lines.join('\n');
}

function buildMessages(overdue, registry, config) {
  const messages = [];
  for (const late of overdue) {
    const member = registry.members.get(late.memberId);
    if (member && member.active) {
      messages.push({
        to: member.email,
        subject: `Tool loan ${late.toolId}: ${late.severity}`,
        body: formatReminder(member, late, config),
      });
    }
  }
  return messages;
}

async function sendAll(messages, transport, attempts) {
  const limit = attempts || 2;
  const report = { sent: 0, failed: [] };
  for (const message of messages) {
    let delivered = false;
    for (let attempt = 1; attempt <= limit && !delivered; attempt += 1) {
      try {
        await transport(message);
        delivered = true;
        report.sent += 1;
      } catch (error) {
        if (attempt === limit) {
          report.failed.push({ to: message.to, reason: error.message });
        }
      }
    }
  }
  return report;
}

module.exports = { SAMPLE_CONTACT, formatReminder, buildMessages, sendAll };
