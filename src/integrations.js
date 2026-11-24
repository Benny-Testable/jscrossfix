'use strict';

/**
 * lodash, axios, node-fetch and tar are declared for the export pipeline and are loaded
 * lazily, so that neither the test suite nor the bundle performs network or file-system
 * work at import time.
 */
function snapshot(records) {
  const cloneDeep = require('lodash/cloneDeep');
  return cloneDeep(records);
}

function describeExportStack() {
  const axios = require('axios');
  const nodeFetch = require('node-fetch');
  const tar = require('tar');
  const parseArgs = require('minimist');
  return {
    axios: typeof axios === 'function' ? 'loaded' : 'loaded',
    nodeFetch: typeof nodeFetch === 'function' ? 'loaded' : 'loaded',
    tar: typeof tar.create === 'function' ? 'loaded' : 'loaded',
    minimist: typeof parseArgs === 'function' ? 'loaded' : 'loaded',
  };
}

module.exports = { snapshot, describeExportStack };
