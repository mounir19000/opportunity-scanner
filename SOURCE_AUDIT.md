# Source audit — 5 October 2026

The active manifest is src/data/repositories.json. A source passes the active-feed bar when its canonical GitHub commit feed is reachable, its latest commit is within 180 days, its configured README branch fetches with HTTP 200, and the parser yields useful, correctly attributed destinations. Internship feeds must predominantly link to individual postings.

| Retained source | Branch | Latest public commit | Live parsed leads | Review |
| --- | --- | --- | ---: | --- |
| [SimplifyJobs/Summer2027-Internships](https://github.com/SimplifyJobs/Summer2027-Internships) | dev | 2026-10-05 | 1,818 | Current 2027 board; five sampled employer/ATS links returned HTTP 200. |
| [speedyapply/2027-SWE-College-Jobs](https://github.com/speedyapply/2027-SWE-College-Jobs) | main | 2026-10-04 | 761 | Current role table; five sampled job links returned HTTP 200. Parser now uses Position and Posting, not company homepages. |
| [hazratali/awesome-ai-summerschool](https://github.com/hazratali/awesome-ai-summerschool) | main | 2026-10-01 | 3 | Current AI school list; two program sites returned HTTP 200. The ANAIS list URL had a TLS problem, so its lead points to the organizer's working official page. |
| [zapplyjobs/Research-Internships-for-Undergraduates](https://github.com/zapplyjobs/Research-Internships-for-Undergraduates) | main | 2026-09-15 | 75 | Maintained directory of real undergraduate research programs. This is a program directory, not a live application-status feed; host cycles must be checked individually. |

Rejected from the active feed:

- [karanwxliaa/Research-for-UG-Students](https://github.com/karanwxliaa/Research-for-UG-Students): last public commit was 2025-03-31. Its program links overlapped heavily with the more recently updated research directory.
- [suco-gt/HPC-Internships](https://github.com/suco-gt/HPC-Internships): updated 2026-09-07, but a review of all 12 retained leads found a direct PNNL posting returning HTTP 404 and several broad directory or employer-homepage links.

Verification commands:

    npm run verify-sources
    npm run prebuild-data
    npm test
    npm run build

The source verifier is read-only and fails if any configured repository is stale, unreachable, misconfigured, or produces no usable leads. The prebuild regenerates the snapshot only when every source succeeds. The last live prebuild fetched all four sources successfully and produced 2,559 deduplicated leads.

Repository and destination checks establish source quality at the feed level. They do not prove that every individual application remains open. Official program pages and employers are the authority for that status.
