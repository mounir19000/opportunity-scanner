# OpportunityRadar cleanup plan

## Audit findings

- The 89 configured entries include a duplicate, 2024/2025 lists, course/resource collections, repositories that returned no listings, and feeds whose extracted links point to badges or section anchors. The 10,516 item snapshot therefore overstates useful opportunities.
- `scripts/fetch_and_prebuild.js` contains duplicate declarations and interleaved old implementations; it does not parse as JavaScript.
- The fetcher invents open deadlines, online locations, and paid compensation when fields are absent. Its broad bullet parser also turns navigation and general resources into opportunities.
- Explorer filtering uses substring matches for categories and locations, treats almost any stipend text as paid, counts unknown deadlines as upcoming, and has an always-failing repository comparison. Deadline sorting compares raw strings.
- The interface claims “verified” and “live” without verification, hardcodes 99+ sources, and mixes dark-only controls with a light mode. `index.html` has duplicate root tags and metadata.

## Implementation

1. Keep a small, documented allowlist of sources with relevant listings and usable outbound links. Prune the bundled snapshot to those sources, reject invalid/navigation links and stale explicit dates, and deduplicate application URLs.
2. Replace the broken prebuild script with one fetcher path. Preserve only observed fields, use stable identifiers, and handle failed sources without corrupting the last good snapshot.
3. Centralize search, facets, deadline parsing, sorting, and funding classification as pure functions. Add focused tests for the failures found in the audit.
4. Redesign the main browsing experience, source directory, navigation, and visual system around a clear editorial layout. Show real counts and honest data caveats.
5. Run tests and a production build, review the diff, and commit the finished work on a dedicated Git branch.

## Curation rule

Keep sources only when they contain actual internships, schools, or research programs with usable destination links and a relevant current or evergreen focus. A source listing is a lead, not proof that applications remain open; the detail and outbound site remain the authority.


## Implemented result

- Reduced the source manifest to four reviewed repositories and refreshed the bundled snapshot on 5 October 2026. The final snapshot has 2,559 deduplicated leads.
- Replaced the malformed prebuild script, corrected table header and fee parsing, removed invented open/paid/location values, and preserved the prior snapshot on a failed rebuild.
- Added one filter engine with exact source and category matching, explicit funding and deadline classification, chronological sorting, and regression tests.
- Rebuilt the explorer, source directory, tracker, insights, activity view, detail dialog, navigation, and visual styles. Removed the unrelated deploy guide and unused components.
- Kept source caveats visible throughout the app. The remaining quality limit is the third-party feed itself: a source entry cannot establish that a host is still accepting applications.
