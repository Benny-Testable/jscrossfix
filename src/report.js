'use strict';

const ejs = require('ejs');
const _ = require('lodash');
const { area } = require('./plots');

const TEMPLATE = [
  '<section>',
  '<h2><%= title %></h2>',
  '<table>',
  '<% rows.forEach(function (row) { %>',
  '<tr><td><%= row.label %></td><td><%= row.value %></td></tr>',
  '<% }); %>',
  '</table>',
  '</section>',
].join('\n');

function plotSummary(plots) {
  const rows = [];
  let total = 0;
  let watered = 0;
  let assigned = 0;
  for (const plot of plots) {
    const size = area(plot);
    total += size;
    if (plot.hasWater) {
      watered += 1;
    }
    if (plot.owner) {
      assigned += 1;
    }
  }
  rows.push({ label: 'Plots', value: plots.length });
  rows.push({ label: 'Total area', value: total });
  rows.push({ label: 'With water', value: watered });
  rows.push({ label: 'Assigned', value: assigned });
  rows.push({ label: 'Free', value: plots.length - assigned });
  return rows;
}

function memberSummary(members) {
  const rows = [];
  let total = 0;
  let watered = 0;
  let assigned = 0;
  for (const member of members) {
    const size = member.plots.length;
    total += size;
    if (member.active) {
      watered += 1;
    }
    if (member.plots.length > 0) {
      assigned += 1;
    }
  }
  rows.push({ label: 'Members', value: members.length });
  rows.push({ label: 'Total plots held', value: total });
  rows.push({ label: 'Active', value: watered });
  rows.push({ label: 'With plots', value: assigned });
  rows.push({ label: 'Without plots', value: members.length - assigned });
  return rows;
}

function renderSection(title, rows) {
  return ejs.render(TEMPLATE, { title, rows });
}

function zoneBreakdown(plots) {
  const byZone = _.groupBy(plots, 'zone');
  return _.map(_.keys(byZone).sort(), (zone) => ({
    label: `Zone ${zone}`,
    value: byZone[zone].length,
  }));
}

function buildReport(plots, members) {
  return [
    renderSection('Plots', plotSummary(plots)),
    renderSection('Zones', zoneBreakdown(plots)),
    renderSection('Members', memberSummary(members)),
  ].join('\n');
}

module.exports = { plotSummary, memberSummary, renderSection, zoneBreakdown, buildReport };
