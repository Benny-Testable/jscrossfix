'use strict';

const fs = require('node:fs');
const { Command } = require('commander');
const { MemberRegistry } = require('./members');
const { importMembers } = require('./csv-import');
const { quoteSeasonFee } = require('./pricing');
const { createPlot } = require('./plots');
const { buildReport } = require('./report');
const { filterPlots } = require('./filters');

function buildProgram(write) {
  const program = new Command();
  program.name('granite').description('Community garden administration').exitOverride();
  program.configureOutput({ writeOut: write, writeErr: write });

  program
    .command('quote')
    .description('quote a season fee')
    .requiredOption('--area <squareMetres>', 'plot area')
    .option('--tier <tier>', 'membership tier', 'standard')
    .option('--water', 'include the water add-on')
    .action((options) => {
      const fee = quoteSeasonFee({ tier: options.tier }, Number(options.area), { water: Boolean(options.water) });
      write(`${fee.toFixed(2)}\n`);
    });

  program
    .command('import <file>')
    .description('import members from a csv file')
    .action((file) => {
      const registry = new MemberRegistry();
      const result = importMembers(fs.readFileSync(file, 'utf8'), registry);
      write(`imported ${result.imported.length}, rejected ${result.rejected.length}\n`);
      for (const item of result.rejected) {
        write(`  line ${item.line}: ${item.reason}\n`);
      }
    });

  program
    .command('report')
    .description('print a demo summary report')
    .option('--filter <query>', 'plot filter query', '')
    .action((options) => {
      const plots = [
        createPlot('p1', { zone: 'a', width: 3, length: 4, hasWater: true }),
        createPlot('p2', { zone: 'b', width: 5, length: 5 }),
      ];
      write(`${buildReport(filterPlots(plots, options.filter), [])}\n`);
    });

  return program;
}

function run(argv, write) {
  const out = write || ((text) => process.stdout.write(text));
  const program = buildProgram(out);
  try {
    program.parse(argv, { from: 'user' });
    return 0;
  } catch (error) {
    if (error.code && error.code.startsWith('commander.')) {
      return error.exitCode || 1;
    }
    out(`error: ${error.message}\n`);
    return 1;
  }
}

module.exports = { buildProgram, run };

if (require.main === module) {
  process.exitCode = run(process.argv.slice(2));
}
