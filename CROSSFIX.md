# jscrossfix — JS_V20_VITE_NPM_MONO-FIXED

QA/Testable cross-fix branch (Node 20, Vite, npm monolith):

- **No `.py` files** — avoids Python tool scheduling on a JavaScript profile.
- **PyDriller corpus harness:** `Tool Triggering (Synthetic Data)/pydriller/run_pydriller.js` + `git-history-analyzer.js`.
- **`package-lock.json` committed** — unlocks platform **`npm-audit`**, **`cyclonedx-npm`**, **`license-checker`**, **`npm-outdated`** (no `file_missing_or_empty` lockfile skip).
- **Git history:** prefer shallow fetch **≥ commit count** (this line is ~324 commits). Corpus `run_pydriller.js` caps analysis at **265** commits from `HEAD`; catalog **pydriller** still needs enough fetched objects (same class of fix as V21 trunc if `bad object` persists).

Canonical remote: https://github.com/Nandhini-Testable/jscrossfix branch **JS_V20_VITE_NPM_MONO-FIXED**.