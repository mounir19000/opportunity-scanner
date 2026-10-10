import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRepositoryOpportunities } from '../src/services/githubFetcher.js';
import { dedupeOpportunities, isUsefulOpportunity, normalizeOpportunity } from '../src/services/opportunityData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = (name) => path.join(root, 'src/data', name);
const sources = JSON.parse(fs.readFileSync(dataPath('repositories.json'), 'utf8'));

async function run() {
  const all = [];
  const logs = [];
  for (const source of sources) {
    const result = await fetchRepositoryOpportunities(source, process.env.GITHUB_TOKEN || '');
    logs.push(result.log);
    all.push(...result.opportunities);
    console.log(source.owner + '/' + source.name + ': ' + result.log.status + ', ' + result.opportunities.length + ' leads');
  }

  fs.writeFileSync(dataPath('initialLogs.json'), JSON.stringify(logs, null, 2) + '\n');
  const failed = logs.filter((log) => log.status !== 'success');
  if (failed.length) {
    throw new Error('Snapshot preserved: ' + failed.length + ' sources failed or produced no useful leads.');
  }

  const items = dedupeOpportunities(all.map(normalizeOpportunity).filter((item) => isUsefulOpportunity(item)));
  if (!items.length) throw new Error('Snapshot preserved: no usable leads.');
  fs.writeFileSync(dataPath('initialOpportunities.json'), JSON.stringify(items, null, 2) + '\n');
  console.log('Saved ' + items.length + ' curated leads.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
