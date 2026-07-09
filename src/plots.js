'use strict';

const { ValidationError } = require('./errors');

const SOIL_TYPES = ['loam', 'clay', 'sand', 'raised-bed'];

function createPlot(id, spec) {
  if (!id) {
    throw new ValidationError('id', 'is required');
  }
  if (!spec || typeof spec !== 'object') {
    throw new ValidationError('plot', 'is required');
  }
  const width = Number(spec.width);
  const length = Number(spec.length);
  if (!(width > 0) || !(length > 0)) {
    throw new ValidationError('size', 'width and length must be positive');
  }
  if (spec.soil !== undefined && !SOIL_TYPES.includes(spec.soil)) {
    throw new ValidationError('soil', `must be one of ${SOIL_TYPES.join(', ')}`);
  }
  return {
    id,
    zone: String(spec.zone || 'A').toUpperCase(),
    row: Number.isInteger(spec.row) ? spec.row : 1,
    width,
    length,
    soil: spec.soil || 'loam',
    owner: null,
    hasWater: Boolean(spec.hasWater),
  };
}

function area(plot) {
  return Math.round(plot.width * plot.length * 100) / 100;
}

function groupByZone(plots) {
  const zones = new Map();
  for (const plot of plots) {
    if (!zones.has(plot.zone)) {
      zones.set(plot.zone, []);
    }
    zones.get(plot.zone).push(plot);
  }
  return zones;
}

function findNeighbours(plots, target) {
  const found = [];
  for (const plot of plots) {
    if (plot.id === target.id) {
      continue;
    }
    if (plot.zone === target.zone) {
      const gap = Math.abs(plot.row - target.row);
      if (gap === 1) {
        found.push(plot);
      } else if (gap === 0 && plot.id < target.id) {
        found.push(plot);
      }
    }
  }
  return found;
}

function assignOwner(plot, memberId) {
  if (plot.owner && plot.owner !== memberId) {
    throw new ValidationError('owner', `plot ${plot.id} is already assigned`);
  }
  return Object.assign({}, plot, { owner: memberId });
}

function releasePlot(plot) {
  return Object.assign({}, plot, { owner: null });
}

module.exports = { SOIL_TYPES, createPlot, area, groupByZone, findNeighbours, assignOwner, releasePlot };
