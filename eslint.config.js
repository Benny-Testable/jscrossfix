'use strict';

const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  exports: 'writable',
  process: 'readonly',
  console: 'readonly',
  __dirname: 'readonly',
  setTimeout: 'readonly',
};

const mochaGlobals = {
  describe: 'readonly',
  it: 'readonly',
  before: 'readonly',
  after: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
};

module.exports = [
  {
    ignores: ['node_modules/', 'coverage/', '.nyc_output/', '.stryker-tmp/', 'reports/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: nodeGlobals,
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'smart'],
      camelcase: ['warn', { properties: 'never' }],
      complexity: ['warn', 10],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      'no-shadow': 'warn',
      semi: ['warn', 'always'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: Object.assign({}, nodeGlobals, mochaGlobals) },
  },
];
