'use strict';

/**
 * Planted performance anti-patterns for the semgrep-perf-static rules
 * (shared/whitebox/analyzer-assets/shared/semgrep-perf-static.yaml). One function per
 * category: n_plus_one, nested_loop, alloc_in_loop, concurrency. Never called by the app.
 */

/** nested_loop: three nested for statements */
function buildCube(size) {
  const cells = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        cells[x * size * size + y * size + z] = x + y + z;
      }
    }
  }
  return cells;
}

/** alloc_in_loop: array push inside nested for loops */
function pairUp(left, right) {
  const pairs = [];
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      pairs.push([left[i], right[j]]);
    }
  }
  return pairs;
}

/** n_plus_one: one network call per element of the loop */
async function loadPrices(skus) {
  const bodies = [];
  for (const sku of skus) {
    const response = await fetch('https://pricing.internal.example/api/price/' + sku);
    bodies.push(await response.text());
  }
  return bodies;
}

/** n_plus_one: classic for loop variant */
async function loadStock(skus) {
  let total = 0;
  for (let i = 0; i < skus.length; i++) {
    const response = await fetch('https://stock.internal.example/api/stock/' + skus[i]);
    total += Number(await response.text());
  }
  return total;
}

/** concurrency: shared array and object mutated inside parallel Promise.all callbacks */
async function collectTotals(items) {
  const list = [];
  const shared = { sum: 0 };
  await Promise.all(
    items.map(async (item) => {
      await Promise.resolve();
      list.push(item * 2);
      shared.sum = shared.sum + item;
    }),
  );
  return { list, sum: shared.sum };
}

module.exports = { buildCube, pairUp, loadPrices, loadStock, collectTotals };

/** sums the cells of a cube built by buildCube */
module.exports.sumCube = function sumCube(size) {
  return buildCube(size).reduce((total, cell) => total + cell, 0);
};
