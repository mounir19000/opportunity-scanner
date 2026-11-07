# Opportunity Scanner

**[Visit the live website](https://global-opportunity-scanner.netlify.app/)**

Opportunity Scanner brings opportunities from nine public sources into one searchable directory. Explore internships, remote jobs, research programmes, scholarships, summer schools, and other learning opportunities without checking each source separately.

You can search and filter listings by type, location, and source. Open any listing to see its details and visit the original page. Save interesting opportunities and keep track of your applications in your browser.

## Staying up to date

The shared directory is updated **every week**. If you want to check for new listings sooner, click **Refresh feeds** at the top of the website. This checks the sources for your browser and may take a few minutes; the weekly update is what everyone sees.

Always confirm deadlines, eligibility, and availability on the original listing before applying.

## Run locally

Use Node.js 22 or newer. The opportunity snapshot is generated from the public sources and is not stored in this repository.

```sh
npm ci
npm run prebuild-data
npm run dev
```

Run `npm test` and `npm run build` to check changes. The Netlify build runs `prebuild-data` before building the site. `GITHUB_TOKEN` is optional for higher GitHub API limits; the scheduled refresh requires `NETLIFY_BUILD_HOOK_URL` in Netlify's environment settings. Keep both values out of Git.

## License

The source code is available under the [MIT License](LICENSE). Opportunity descriptions and other third-party listing content belong to their respective sources and are generated during deployment.
