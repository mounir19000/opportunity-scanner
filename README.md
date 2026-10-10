# Opportunity Radar

A directory of scholarships, fellowships, grants, research internships, hackathons, and exchange programmes. Explore includes 14 reviewed programmes and 613 source leads. The page has a search across both collections, filters suited to each collection, a personal radar score for reviewed programmes, a watchlist, and application details. The Source Archive lists the tracked GitHub feeds.

The visual system follows [ScholarHub](https://github.com/EhsanulHaqueSiam/ScholarHub): warm cream canvas, cobalt accents, bold Archivo headings, square borders, and hard offset shadows. Its component source and tokens informed this implementation.

## Current scope

The curated catalogue in `src/lib/mock-data.ts` was reviewed on 10 October 2026. A published ISO deadline is shown only when a specific official date is available. `null` means the next deadline varies or is unannounced. Every detail sheet links to the official source. These are curated examples, not an automatically updated feed.

The source lead snapshot was reduced to three active sources and refreshed for the international internship file on 10 October 2026: 613 leads. These leads are browsable in Explore with their own filters and pagination. The default sort puts listings with more supplied details first; source order and other sorts remain available. The Source Archive shows the feeds and supports refreshing them.

| Source | Focus |
| --- | --- |
| [speedyapply/2027-SWE-College-Jobs: INTERN_INTL.md](https://github.com/speedyapply/2027-SWE-College-Jobs/blob/main/INTERN_INTL.md) | International software internships; only this file is imported |
| [hazratali/awesome-ai-summerschool](https://github.com/hazratali/awesome-ai-summerschool) | AI and ML seasonal schools |
| [zapplyjobs/Research-Internships-for-Undergraduates](https://github.com/zapplyjobs/Research-Internships-for-Undergraduates) | Undergraduate research internships |

Sources were retained because their recent listings led to relevant program or employer pages. The older catalog included duplicate repositories, old seasons, course collections, broken links, and parsed navigation links. See [PLAN.md](PLAN.md) for the audit and decisions.

For the undergraduate research source, each lead inherits the country heading above it in the README. The two worldwide groups use broad location labels because they do not specify one country for every programme.

## Run locally

Requires Node.js 20 or newer.

    npm install
    npm run dev

Open the **Network** URL printed by Vite on another device connected to the same local network. The address depends on your current Wi-Fi or Ethernet connection and may change. The app uses a committed catalogue and feed snapshot, so browsing works without GitHub access. Search and facets are synced to the URL. The radar profile, bookmarks, notes, application stages, and theme preference stay in this browser's local storage.

## Refresh data

    npm run prebuild-data

This fetches the configured files in src/data/repositories.json, parses their listings, rejects bad links and explicit expired dates, then deduplicates destination URLs. The speedyapply source reads only `main/INTERN_INTL.md`; it does not fall back to README or the USA internship files. The old opportunity snapshot is preserved if any configured source fails or produces no usable leads; fetch logs are written to src/data/initialLogs.json.

Run npm run curate-snapshot to re-apply the quality rules to the already bundled snapshot. The source allowlist and expected branches live in src/data/repositories.json.

## Verify

    npm test
    npm run verify-sources
    npm run build

The tests cover URL filters, facet logic, radar weights, deadline ordering, source keys, invalid links, and table parsing. The live source verifier checks public commit activity, the configured branch, successful README parsing, and whether internship links lead to specific postings. The app distinguishes an unlisted deadline or funding amount from an explicitly dated or funded opportunity.

## Known limits

- The feeds are third-party lists. A successful parse does not prove that an application is open or that an outbound page still exists.
- Most sources omit deadlines, pay, and eligibility. The interface leaves those fields unlisted, and filters require explicit data.
- Browser refreshes affect the current session. Rebuild the committed snapshot to update all deployed visitors.
- Source-specific adapters would improve status detection and structured fields further, especially for large internship tables.
- Radar scores are a 35/35/30 fit estimate for degree, field, and nationality; they do not establish eligibility. Read the full official call before applying.
- The “No IELTS required” quick tag covers only programmes whose published rules do not list IELTS. Other English-language or admission requirements may still apply.
- Curated deadlines and funding terms need periodic manual review. The detail sheet shows the review date and links to the source.
