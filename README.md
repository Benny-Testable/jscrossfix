# GraniteMill

GraniteMill is a small Node.js library and command line tool for running a
community garden: plots, members, shared tool loans, bookings, waiting lists and
season fees.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

```sh
npm ci
npm test
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm test` | runs the mocha suite in `tests/` |
| `npm run coverage` | runs the suite under nyc and prints a coverage table |
| `npm run lint` | runs eslint with the flat config in `eslint.config.js` |
| `npx stryker run` | mutation testing of `src/` (writes `reports/`) |
| `npm start -- quote --area 12 --water` | quotes a season fee from the command line |

## Layout

```
src/
  plots.js          plot model, zones, neighbours, owners
  members.js        member registry and plot limits
  pricing.js        season fees, late fees, installments
  reservations.js   shared resource bookings
  waitlist.js       waiting list with tier priority
  inventory.js      tool loans and overdue handling
  schedule.js       watering rota and date helpers
  csv-import.js     member import from csv text
  filters.js        plot filters from query strings
  report.js         html summary report
  storage.js        json file store
  notifications.js  reminder messages
  config.js         defaults and data version check
  cli.js            command line entry point
tests/              mocha tests, one file per module
```

## Notes

All credentials, e-mail addresses and phone numbers in `src/config.js` and
`src/notifications.js` are sample values for local development.

## License

MIT, see `LICENSE`.
<!-- dummy PR 2026-11-19 06:54:05 -->
<!-- dummy PR 2026-11-20 07:24:13 -->
