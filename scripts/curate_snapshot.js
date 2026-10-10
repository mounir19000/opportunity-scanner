import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dedupeOpportunities, isUsefulOpportunity, normalizeOpportunity, sourceKey } from '../src/services/opportunityData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = (name) => path.join(root, 'src/data', name);

const sources = JSON.parse(fs.readFileSync(data('repositories.json'), 'utf8'));

const allowed = new Map(sources.map((source) => [sourceKey(source), source]));
const snapshot = JSON.parse(fs.readFileSync(data('initialOpportunities.json'), 'utf8'));
const curated = dedupeOpportunities(snapshot
  .filter((item) => allowed.has(sourceKey(item.sourceRepo)))
  .map((item) => {
    const normalized = normalizeOpportunity(item);
    normalized.category = allowed.get(normalized.sourceRepo).category;
    normalized.eligibility = '';
    if (!normalized.notes) delete normalized.notes;
    return normalized;
  })
  .filter((item) => isUsefulOpportunity(item)));

fs.writeFileSync(data('initialOpportunities.json'), `${JSON.stringify(curated, null, 2)}\n`);
fs.writeFileSync(data('initialLogs.json'), '[]\n');
console.log(`Curated ${curated.length} usable leads from ${sources.length} sources.`);
