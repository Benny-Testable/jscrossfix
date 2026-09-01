'use strict';

const { ValidationError } = require('./errors');

function parseLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseCsv(text) {
  const lines = String(text).split(/\r?\n/);
  const header = parseLine(lines[0]).map((name) => name.toLowerCase());
  const rows = [];
  for (let n = 1; n < lines.length; n += 1) {
    if (lines[n].trim() === '') {
      continue;
    }
    const cells = parseLine(lines[n]);
    if (cells.length !== header.length) {
      throw new ValidationError('csv', `line ${n + 1} has ${cells.length} cells, expected ${header.length}`);
    }
    const row = {};
    header.forEach((name, idx) => {
      row[name] = cells[idx];
    });
    rows.push(row);
  }
  return rows;
}

function importMembers(text, registry) {
  const imported = [];
  const rejected = [];
  let rows;
  try {
    rows = parseCsv(text);
  } catch (error) {
    return { imported, rejected: [{ line: 0, reason: error.message }] };
  }
  rows.forEach((row, idx) => {
    try {
      imported.push(registry.register(row));
    } catch (error) {
      rejected.push({ line: idx + 2, reason: error.message });
    }
  });
  return { imported, rejected };
}

module.exports = { parseLine, parseCsv, importMembers };
