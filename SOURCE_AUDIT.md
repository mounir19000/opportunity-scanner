# Source audit — 10 October 2026

The active source list is `src/data/repositories.json`. The deployable data is `public/opportunities.json`. The importer keeps computing and closely related opportunities, rejects known past deadlines, and saves the details each source actually publishes: summary, host, location, dates, funding, eligibility, benefits, application instructions, original article, and an application link when one can be identified.

| Source | Import path | Current leads | Notes |
| --- | --- | ---: | --- |
| [speedyapply/2027-SWE-College-Jobs](https://github.com/speedyapply/2027-SWE-College-Jobs/blob/main/INTERN_INTL.md) | `main/INTERN_INTL.md` | 537 | International software internship file; individual posting links. |
| [hazratali/awesome-ai-summerschool](https://github.com/hazratali/awesome-ai-summerschool) | `main/README.md` | 3 | Current AI school programs; one broken list URL is replaced with the organizer's working page. |
| [zapplyjobs/Research-Internships-for-Undergraduates](https://github.com/zapplyjobs/Research-Internships-for-Undergraduates) | `main/README.md` | 75 | Undergraduate research directory with locations from country headings. |
| [Global South Opportunities](https://www.globalsouthopportunities.com/) | Public WordPress posts from the last two years | 435 | Scans every recent page; retains computing and adjacent fields from titles and article details. |
| [Opportunities Corners](https://opportunitiescorners.com/) | Public WordPress posts from the last two years | 27 | Pulls full articles, including eligibility, funding, and application instructions where present. |
| [For9a](https://www.for9a.com/en) | Public active education and jobs listings, computing search terms, and detail pages | 47 | Reads structured opportunity details and application instructions. Application links are shown only when they can be matched to the listing. |

The three website sources are refreshed by the prebuild and the scheduled GitHub Actions snapshot job. Browser refresh also works for all six sources: it scans the last 30 days of WordPress posts and merges them with existing listings, while For9a refresh checks all active public listings. Every website listing links back to its article or detail page. A missing field means the importer did not find a reliable value in the source; it does not imply that the benefit, deadline, or requirement does not exist. The app shows the source's publication date when available. Applicants should confirm each opportunity on the original page and official application site.

Verification commands:

    npm run verify-sources
    npm run prebuild-data
    npm test
    npm run build

The source verifier samples each website and checks the GitHub repositories. The prebuild preserves the previous snapshot if any configured source fails or yields no usable leads. The resulting snapshot has 1,124 unique leads from six sources.

Previously rejected GitHub sources remain excluded: `karanwxliaa/Research-for-UG-Students` was stale, and `suco-gt/HPC-Internships` had broken and overly broad destination links.
