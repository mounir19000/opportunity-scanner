# Source audit — 10 October 2026

The active manifest is src/data/repositories.json. A source passes the active-feed bar when its canonical GitHub commit feed is reachable, its latest commit is within 180 days, its configured branch and file fetch with HTTP 200, and the parser yields useful, correctly attributed destinations. Internship feeds must predominantly link to individual postings.

| Retained source | Branch | Latest public commit | Live parsed leads | Review |
| --- | --- | --- | ---: | --- |
| [speedyapply/2027-SWE-College-Jobs: INTERN_INTL.md](https://github.com/speedyapply/2027-SWE-College-Jobs/blob/main/INTERN_INTL.md) | main | 2026-10-09 | 535 | Only the international internship file is fetched. The parser uses Position and Posting, not company homepages. |
| [hazratali/awesome-ai-summerschool](https://github.com/hazratali/awesome-ai-summerschool) | main | 2026-10-01 | 3 | Current AI school list; two program sites returned HTTP 200. The ANAIS list URL had a TLS problem, so its lead points to the organizer's working official page. |
| [zapplyjobs/Research-Internships-for-Undergraduates](https://github.com/zapplyjobs/Research-Internships-for-Undergraduates) | main | 2026-10-07 | 75 | Country headings in the README now populate each lead's location. Worldwide groups receive broad labels. Host cycles and eligibility must be checked individually. |

Rejected from the active feed:

- [karanwxliaa/Research-for-UG-Students](https://github.com/karanwxliaa/Research-for-UG-Students): last public commit was 2025-03-31. Its program links overlapped heavily with the more recently updated research directory.
- [suco-gt/HPC-Internships](https://github.com/suco-gt/HPC-Internships): updated 2026-09-07, but a review of all 12 retained leads found a direct PNNL posting returning HTTP 404 and several broad directory or employer-homepage links.

Verification commands:

    npm run verify-sources
    npm run prebuild-data
    npm test
    npm run build

The source verifier is read-only and fails if any configured repository is stale, unreachable, misconfigured, or produces no usable leads. The prebuild regenerates the snapshot only when every source succeeds. The current bundled snapshot has 613 leads from three sources, including 535 from `main/INTERN_INTL.md`.

Repository and destination checks establish source quality at the feed level. An international-list entry does not establish citizenship or work-authorization eligibility, and it does not prove that an application remains open. Official program pages and employers are the authority for those details.
