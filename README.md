# OpportunityRadar

A focused browser for internships, summer schools, and research programs collected from a small set of public GitHub repositories. Listings are **leads**, not verified open applications. Open the original destination to confirm dates, eligibility, and availability.

## Current scope

The bundled snapshot was refreshed on 5 October 2026: 2,559 leads from four sources.

| Source | Focus |
| --- | --- |
| [SimplifyJobs/Summer2027-Internships](https://github.com/SimplifyJobs/Summer2027-Internships) | 2027 internships across tech roles |
| [speedyapply/2027-SWE-College-Jobs](https://github.com/speedyapply/2027-SWE-College-Jobs) | 2027 software internships and early career roles |
| [hazratali/awesome-ai-summerschool](https://github.com/hazratali/awesome-ai-summerschool) | AI and ML seasonal schools |
| [zapplyjobs/Research-Internships-for-Undergraduates](https://github.com/zapplyjobs/Research-Internships-for-Undergraduates) | Undergraduate research internships |

Sources were retained because their recent listings led to relevant program or employer pages. The older catalog included duplicate repositories, old seasons, course collections, broken links, and parsed navigation links. See [PLAN.md](PLAN.md) for the audit and decisions.

## Run locally

Requires Node.js 20 or newer.

    npm install
    npm run dev

Open the URL printed by Vite. The app uses a committed snapshot, so browsing works without GitHub access. Bookmarks, notes, application stages, and theme preference stay in the browser's local storage.

## Refresh data

    npm run prebuild-data

This fetches the configured sources in src/data/repositories.json, parses the README listings, rejects bad links and explicit expired dates, then deduplicates destination URLs. The old opportunity snapshot is preserved if any configured source fails or produces no usable leads; fetch logs are written to src/data/initialLogs.json.

Run npm run curate-snapshot to re-apply the quality rules to the already bundled snapshot. The source allowlist and expected branches live in src/data/repositories.json.

## Verify

    npm test
    npm run verify-sources
    npm run build

The tests cover source keys, date and funding classification, filters, invalid links, and table parsing. The live source verifier checks public commit activity, the configured branch, successful README parsing, and whether internship links lead to specific postings. The app distinguishes an unlisted deadline or funding amount from an explicitly dated or funded opportunity.

## Known limits

- The feeds are third-party lists. A successful parse does not prove that an application is open or that an outbound page still exists.
- Most sources omit deadlines, pay, and eligibility. The interface leaves those fields unlisted, and filters require explicit data.
- Browser refreshes affect the current session. Rebuild the committed snapshot to update all deployed visitors.
- Source-specific adapters would improve status detection and structured fields further, especially for large internship tables.
