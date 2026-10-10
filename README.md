# Opportunity Scanner

A web app that brings computing opportunities from six public sources into one searchable directory.

Run `npm install` and `npm run dev` locally. `npm run prebuild-data` refreshes the deployable `public/opportunities.json` snapshot from all configured sources. `npm run verify-sources` checks that each source is reachable and yields usable listings. The production build reads the committed snapshot; the scheduled GitHub Actions job refreshes it every three days.

The browser can refresh all six sources directly. A manual WordPress refresh checks the last 30 days of posts and merges new listings with the published directory; For9a refresh checks its active listings. The scheduled snapshot job still scans the full recent WordPress archives every three days. See [SOURCE_AUDIT.md](SOURCE_AUDIT.md) for coverage and limits.
