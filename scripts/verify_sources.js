import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRepositoryOpportunities } from '../src/services/githubFetcher.js';
import { fetchWebSource } from './webFetcher.js';
import { isUsefulOpportunity, sourceKey } from '../src/services/opportunityData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'src/data/repositories.json'), 'utf8'));
const MAX_COMMIT_AGE_DAYS = 180;

async function fetchFeed(url) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
  throw lastError;
}

async function run() {
  if (!Array.isArray(sources) || sources.length === 0) throw new Error('No configured sources');
  const seen = new Set();
  const errors = [];

  for (const source of sources) {
    const key = sourceKey(source);
    try {
      if (seen.has(key)) throw new Error('Invalid or duplicate source key');
      seen.add(key);
      if (source.type === 'website') {
        if (!/^[a-z0-9.-]+$/.test(key) || !source.url.startsWith('https://') || !source.apiUrl.startsWith('https://')) throw new Error('Invalid website source configuration');
        const options = source.id === 'for9a.com' ? { sampleDetails: 3 }
          : source.id === 'weworkremotely.com' ? { sampleFeeds: 1 } : { samplePages: 1 };
        const { opportunities, log } = await fetchWebSource(source, options);
        if (log.status !== 'success' || !opportunities.length || opportunities.some((item) => sourceKey(item.sourceRepo) !== key || !isUsefulOpportunity(item))) {
          throw new Error('Website sample fetch/parse failed: ' + (log.error || log.message));
        }
        console.log(key + ' | OK | ' + opportunities.length + ' sampled leads');
        continue;
      }
      const repoPath = source.owner + '/' + source.name;
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoPath)
        || (source.id && source.id !== repoPath + '/' + source.file)) throw new Error('Invalid repository key');
      if (source.url !== 'https://github.com/' + repoPath) throw new Error('Source URL is not canonical');
      if (!/^[A-Za-z0-9_.-]+$/.test(source.branch || '')) throw new Error('Explicit branch is required');
      if (source.file && !/^[A-Za-z0-9_.-]+\.md$/i.test(source.file)) throw new Error('Invalid configured Markdown file');

      const feed = await fetchFeed('https://github.com/' + repoPath + '/commits/' + source.branch + '.atom');
      if (!feed.includes('Recent Commits to ' + source.name + ':' + source.branch)) throw new Error('Commit feed does not match source');
      const updated = feed.match(/<updated>([^<]+)<\/updated>/)?.[1];
      const updatedAt = new Date(updated);
      if (!updated || Number.isNaN(updatedAt.getTime())) throw new Error('Commit feed has no valid update date');
      const ageDays = Math.floor((Date.now() - updatedAt.getTime()) / 86400000);
      if (ageDays < -1 || ageDays > MAX_COMMIT_AGE_DAYS) throw new Error('Last commit is ' + ageDays + ' days old');

      const { opportunities, log } = await fetchRepositoryOpportunities(source);
      if (log.status !== 'success' || log.statusCode !== 200 || opportunities.length === 0) {
        throw new Error('Source file fetch/parse failed: ' + (log.error || log.message));
      }
      if (!log.message.includes(source.branch + '/' + (source.file || 'README.md'))) throw new Error('Fetched an unexpected branch or file');
      if (opportunities.some((item) => sourceKey(item.sourceRepo) !== key || !isUsefulOpportunity(item))) {
        throw new Error('Parser returned invalid or misattributed leads');
      }
      const urls = opportunities.map((item) => item.url);
      if (new Set(urls).size !== urls.length) throw new Error('Parser returned duplicate links');
      if (source.category === 'Internships') {
        const specific = urls.filter((value) => {
          const url = new URL(value);
          return url.pathname !== '/' || [...url.searchParams.keys()].some((param) => !/^(utm_|ref$)/i.test(param));
        }).length;
        if (specific / urls.length < 0.9) throw new Error('Too many links lead to company homepages');
      }
      console.log(key + ' | OK | ' + opportunities.length + ' leads | commit ' + updated.slice(0, 10) + ' | branch ' + source.branch);
    } catch (error) {
      errors.push(key + ': ' + (error.message || String(error)));
      console.error(key + ' | FAIL | ' + (error.message || String(error)));
    }
  }
  if (errors.length) throw new Error(errors.length + ' of ' + sources.length + ' sources failed verification');
  console.log('Verified all ' + sources.length + ' configured sources.');
}

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
