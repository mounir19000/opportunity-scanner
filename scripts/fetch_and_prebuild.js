import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRepositoryOpportunities } from '../src/services/githubFetcher.js';
import { canonicalUrl, dedupeOpportunities, isUsefulOpportunity, normalizeOpportunity } from '../src/services/opportunityData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = (name) => path.join(root, 'src/data', name);
const sources = JSON.parse(fs.readFileSync(dataPath('repositories.json'), 'utf8'));
const snapshotPath = path.join(root, 'public/opportunities.json');

async function run() {
  const previousSnapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const previousItems = Array.isArray(previousSnapshot) ? previousSnapshot : previousSnapshot.items || [];
  const firstSeenByUrl = new Map(previousItems.map((item) => [canonicalUrl(item.url), item.discoveredAt]));
  const all = [];
  const logs = [];
  for (const source of sources) {
    const result = await fetchRepositoryOpportunities(source, process.env.GITHUB_TOKEN || '');
    logs.push(result.log);
    all.push(...result.opportunities);
    console.log(source.owner + '/' + source.name + ': ' + result.log.status + ', ' + result.opportunities.length + ' leads');
  }

  const failed = logs.filter((log) => log.status !== 'success');
  if (failed.length) {
    throw new Error('Snapshot preserved: ' + failed.length + ' sources failed or produced no useful leads.');
  }

  const items = dedupeOpportunities(all.map(normalizeOpportunity).filter((item) => isUsefulOpportunity(item)).map((item) => ({
    ...item,
    discoveredAt: firstSeenByUrl.get(canonicalUrl(item.url)) || item.discoveredAt,
  })));
  if (!items.length) throw new Error('Snapshot preserved: no usable leads.');
  if (JSON.stringify(items) === JSON.stringify(previousItems)) {
    console.log('Snapshot unchanged: ' + items.length + ' leads.');
    return;
  }
  fs.writeFileSync(snapshotPath, JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + '\n');
  console.log('Saved ' + items.length + ' source leads.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
