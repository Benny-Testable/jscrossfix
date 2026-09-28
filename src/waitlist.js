'use strict';

const { ConflictError, NotFoundError } = require('./errors');

const PRIORITY = { family: 2, senior: 1, student: 1, standard: 0 };

class Waitlist {
  constructor() {
    this.entries = [];
    this.counter = 0;
  }

  join(member, zone) {
    if (this.entries.some((entry) => entry.memberId === member.id)) {
      throw new ConflictError(`member ${member.id} is already waiting`);
    }
    this.counter += 1;
    this.entries.push({
      memberId: member.id,
      zone: zone || null,
      priority: PRIORITY[member.tier] || 0,
      order: this.counter,
    });
    this.entries.sort((a, b) => b.priority - a.priority || a.order - b.order);
  }

  position(memberId) {
    const index = this.entries.findIndex((entry) => entry.memberId === memberId);
    if (index === -1) {
      throw new NotFoundError('waitlist entry', memberId);
    }
    return index;
  }

  leave(memberId) {
    const before = this.entries.length;
    this.entries = this.entries.filter((entry) => entry.memberId !== memberId);
    return this.entries.length < before;
  }

  nextFor(zone) {
    for (const entry of this.entries) {
      if (entry.zone === null || entry.zone === zone) {
        return entry;
      }
    }
    return null;
  }

  promote(freePlots, registry) {
    const assignments = [];
    for (const plot of freePlots) {
      const entry = this.nextFor(plot.zone);
      if (!entry) {
        continue;
      }
      try {
        registry.claimPlot(entry.memberId, plot.id);
        assignments.push({ memberId: entry.memberId, plotId: plot.id });
        this.leave(entry.memberId);
      } catch (error) {
        if (error instanceof ConflictError) {
          this.leave(entry.memberId);
        } else {
          throw error;
        }
      }
    }
    return assignments;
  }

  size() {
    return this.entries.length;
  }
}

module.exports = { PRIORITY, Waitlist };
