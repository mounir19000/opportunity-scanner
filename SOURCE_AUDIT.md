# Source audit — 29 October 2026

The active source list is `src/data/repositories.json`. The deployable data is generated as `public/opportunities.json` during the Netlify build and is not committed. The importer keeps computing and closely related opportunities, rejects known past deadlines, and saves the details each source actually publishes: summary, host, location, dates, funding, eligibility, benefits, application instructions, original article, and an application link when one can be identified.

| Source | Import path | Leads at 29 October audit | Notes |
| --- | --- | ---: | --- |
| [speedyapply/2027-SWE-College-Jobs](https://github.com/speedyapply/2027-SWE-College-Jobs/blob/main/INTERN_INTL.md) | `main/INTERN_INTL.md` | 655 | International software internship file; individual posting links. |
| [speedyapply/2027-AI-College-Jobs internships](https://github.com/speedyapply/2027-AI-College-Jobs/blob/main/INTERN_INTL.md) | `main/INTERN_INTL.md` | 655 | International AI internships only; explicit US-only locations are rejected. |
| [speedyapply/2027-AI-College-Jobs new graduate jobs](https://github.com/speedyapply/2027-AI-College-Jobs/blob/main/NEW_GRAD_INTL.md) | `main/NEW_GRAD_INTL.md` | 597 | International AI new graduate jobs only; explicit US-only locations are rejected. |
| [We Work Remotely](https://weworkremotely.com/remote-job-rss-feed) | Public all-jobs and category RSS feeds | 481 | Current remote jobs across all categories and regions, deduplicated by listing URL. Each lead links back to We Work Remotely. |
| [hazratali/awesome-ai-summerschool](https://github.com/hazratali/awesome-ai-summerschool) | `main/README.md` | 8 | Current AI school programs; one broken list URL is replaced with the organizer's working page. |
| [zapplyjobs/Research-Internships-for-Undergraduates](https://github.com/zapplyjobs/Research-Internships-for-Undergraduates) | `main/README.md` | 75 | Undergraduate research directory with locations from country headings. |
| [Global South Opportunities](https://www.globalsouthopportunities.com/) | Public WordPress posts from the last two years | 485 | Scans every recent page; retains computing and adjacent fields from titles and article details. |
| [Opportunities Corners](https://opportunitiescorners.com/) | Public WordPress posts from the last two years | 28 | Pulls full articles, including eligibility, funding, and application instructions where present. |
| [For9a](https://www.for9a.com/en) | Public active education and jobs listings, computing search terms, and detail pages | 62 | Reads structured opportunity details and application instructions. Application links are shown only when they can be matched to the listing. |

The four website sources are refreshed by the Netlify prebuild on each deploy, including the weekly scheduled build. Browser refresh works for all nine sources: it scans the last 30 days of WordPress posts and merges them with existing listings, while For9a checks active public listings and We Work Remotely reads its public RSS feeds. The We Work Remotely feed [allows public use with attribution](https://weworkremotely.com/remote-job-rss-feed); listings link to their original We Work Remotely pages. The AI college jobs importer reads only the two `*_INTL.md` files. A missing field means the importer did not find a reliable value in the source; it does not imply that the benefit, deadline, or requirement does not exist. The app shows the source's publication date when available. Applicants should confirm each opportunity on the original page and official application site.

Verification commands:

    npm run verify-sources
    npm run prebuild-data
    npm test
    npm run build

The source verifier samples each website and checks the GitHub repositories. The prebuild requires every configured source to succeed and leaves an existing local snapshot untouched if a source fails. The generated listing count varies with the sources.

Previously rejected GitHub sources remain excluded: `karanwxliaa/Research-for-UG-Students` was stale, and `suco-gt/HPC-Internships` had broken and overly broad destination links.
