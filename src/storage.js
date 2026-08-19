'use strict';

const fs = require('node:fs');
const path = require('node:path');
const _ = require('lodash');
const { newId } = require('./ids');
const { GardenError } = require('./errors');

class JsonStore {
  constructor(directory) {
    this.directory = directory;
  }

  fileFor(name) {
    return path.join(this.directory, `${name}.json`);
  }

  save(name, data) {
    fs.mkdirSync(this.directory, { recursive: true });
    const target = this.fileFor(name);
    const temp = `${target}.${newId('tmp')}`;
    fs.writeFileSync(temp, JSON.stringify(_.cloneDeep(data), null, 2));
    fs.renameSync(temp, target);
    return target;
  }

  load(name, fallback) {
    let raw;
    try {
      raw = fs.readFileSync(this.fileFor(name), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT' && fallback !== undefined) {
        return fallback;
      }
      throw error;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new GardenError(`corrupt data file ${name}: ${error.message}`, 'CORRUPT');
    }
  }

  remove(name) {
    try {
      fs.unlinkSync(this.fileFor(name));
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  list() {
    if (!fs.existsSync(this.directory)) {
      return [];
    }
    return fs
      .readdirSync(this.directory)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.slice(0, -5))
      .sort();
  }

  summarize(name, keys) {
    const data = this.load(name);
    return _.pick(data, keys);
  }
}

module.exports = { JsonStore };
