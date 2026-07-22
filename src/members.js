'use strict';

const { validateMember } = require('./validators');
const { ConflictError, NotFoundError, ValidationError } = require('./errors');

class MemberRegistry {
  constructor() {
    this.members = new Map();
    this.nextId = 1;
  }

  register(input) {
    const member = validateMember(input);
    for (const existing of this.members.values()) {
      if (existing.email === member.email) {
        throw new ConflictError(`email ${member.email} is already registered`);
      }
    }
    const id = `m${this.nextId}`;
    this.nextId += 1;
    const record = Object.assign({ id, active: true, plots: [] }, member);
    this.members.set(id, record);
    return record;
  }

  get(id) {
    const member = this.members.get(id);
    if (!member) {
      throw new NotFoundError('member', id);
    }
    return member;
  }

  changeTier(id, tier) {
    const member = this.get(id);
    const checked = validateMember({ name: member.name, email: member.email, tier });
    member.tier = checked.tier;
    return member;
  }

  claimPlot(id, plotId, limit) {
    const member = this.get(id);
    if (!member.active) {
      throw new ValidationError('member', `${id} is not active`);
    }
    const max = limit === undefined ? 2 : limit;
    if (member.plots.includes(plotId)) {
      return member;
    }
    if (member.plots.length >= max) {
      throw new ConflictError(`member ${id} already holds ${max} plots`);
    }
    member.plots.push(plotId);
    return member;
  }

  deactivate(id) {
    const member = this.get(id);
    member.active = false;
    const released = member.plots.slice();
    member.plots = [];
    return released;
  }

  search(term) {
    const needle = String(term || '').trim().toLowerCase();
    const result = [];
    for (const member of this.members.values()) {
      if (!needle || member.name.toLowerCase().includes(needle) || member.email.includes(needle)) {
        result.push(member);
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  countByTier() {
    const counts = {};
    for (const member of this.members.values()) {
      if (member.active) {
        counts[member.tier] = (counts[member.tier] || 0) + 1;
      }
    }
    return counts;
  }
}

module.exports = { MemberRegistry };
