'use strict';

const { ConflictError, NotFoundError, ValidationError } = require('./errors');
const { DAY } = require('./schedule');

const LOAN_DAYS = { shovel: 3, wheelbarrow: 2, tiller: 1, default: 5 };
const CONDITIONS = ['new', 'good', 'worn', 'broken'];

class ToolInventory {
  constructor() {
    this.tools = new Map();
    this.loans = [];
  }

  add(id, kind, condition) {
    if (this.tools.has(id)) {
      throw new ConflictError(`tool ${id} already exists`);
    }
    const state = condition || 'good';
    if (!CONDITIONS.includes(state)) {
      throw new ValidationError('condition', `must be one of ${CONDITIONS.join(', ')}`);
    }
    const tool = { id, kind, condition: state, loanedTo: null };
    this.tools.set(id, tool);
    return tool;
  }

  loanPeriod(kind) {
    const days = LOAN_DAYS[kind];
    return (days === undefined ? LOAN_DAYS.default : days) * DAY;
  }

  checkout(id, memberId, now) {
    const tool = this.tools.get(id);
    if (!tool) {
      throw new NotFoundError('tool', id);
    }
    if (tool.condition === 'broken') {
      throw new ConflictError(`tool ${id} is broken`);
    }
    if (tool.loanedTo) {
      throw new ConflictError(`tool ${id} is already on loan`);
    }
    const open = this.loans.filter((loan) => loan.memberId === memberId && !loan.returnedAt);
    if (open.length >= 2) {
      throw new ConflictError(`member ${memberId} has too many open loans`);
    }
    const loan = { toolId: id, memberId, out: now, due: now + this.loanPeriod(tool.kind), returnedAt: null };
    tool.loanedTo = memberId;
    this.loans.push(loan);
    return loan;
  }

  checkin(id, now, condition) {
    const tool = this.tools.get(id);
    if (!tool || !tool.loanedTo) {
      throw new NotFoundError('loan', id);
    }
    const loan = this.loans.find((item) => item.toolId === id && !item.returnedAt);
    loan.returnedAt = now;
    tool.loanedTo = null;
    if (condition && CONDITIONS.includes(condition)) {
      tool.condition = condition;
    }
    return Math.max(0, Math.ceil((now - loan.due) / DAY));
  }

  overdue(now) {
    const late = [];
    for (const loan of this.loans) {
      if (!loan.returnedAt && loan.due < now) {
        const days = Math.ceil((now - loan.due) / DAY);
        let severity = 'notice';
        if (days > 14) {
          severity = 'suspend';
        } else if (days > 7) {
          severity = 'warning';
        }
        late.push({ toolId: loan.toolId, memberId: loan.memberId, days, severity });
      }
    }
    return late.sort((a, b) => b.days - a.days);
  }

  countByKind() {
    const counts = {};
    for (const tool of this.tools.values()) {
      counts[tool.kind] = (counts[tool.kind] || 0) + 1;
    }
    return counts;
  }
}

module.exports = { LOAN_DAYS, CONDITIONS, ToolInventory };
