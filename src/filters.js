'use strict';

const qs = require('qs');
const { area } = require('./plots');
const { ValidationError } = require('./errors');

const NUMERIC_FIELDS = ['min_area', 'max_area', 'row'];

function parseFilters(query) {
  const raw = qs.parse(String(query || '').replace(/^\?/, ''), { depth: 1, parameterLimit: 20 });
  const filters = {};
  for (const key of Object.keys(raw)) {
    const value = raw[key];
    if (NUMERIC_FIELDS.includes(key)) {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        throw new ValidationError(key, 'must be a number');
      }
      filters[key] = parsed;
    } else if (value === 'true' || value === 'false') {
      filters[key] = value === 'true';
    } else {
      filters[key] = value;
    }
  }
  return filters;
}

function matches(plot, filters) {
  for (const field of Object.keys(filters)) {
    const wanted = filters[field];
    if (field === 'min_area') {
      if (area(plot) < wanted) {
        return false;
      }
    } else if (field === 'max_area') {
      if (area(plot) > wanted) {
        return false;
      }
    } else if (field === 'free') {
      if (Boolean(plot.owner) === wanted) {
        return false;
      }
    } else if (plot[field] !== wanted) {
      return false;
    }
  }
  return true;
}

function filterPlots(plots, query) {
  const filters = parseFilters(query);
  return plots.filter((plot) => matches(plot, filters));
}

function toQuery(filters) {
  return qs.stringify(filters, { sort: (a, b) => a.localeCompare(b) });
}

module.exports = { parseFilters, matches, filterPlots, toQuery };
