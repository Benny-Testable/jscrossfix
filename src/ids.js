'use strict';

const { v4: uuidv4 } = require('uuid');

function newId(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
}

function hasPrefix(id, prefix) {
  return typeof id === 'string' && id.startsWith(`${prefix}_`) && id.length === prefix.length + 13;
}

module.exports = { newId, hasPrefix };
