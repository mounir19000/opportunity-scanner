import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dedupeOpportunities, isUsefulOpportunity, normalizeOpportunity, sourceKey } from '../src/services/opportunityData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = (name) => path.join(root, 'src/data', name);

// Each retained source produced program or role links in the September 2026 snapshot.
const sources = [
  { owner: 'SimplifyJobs', name: 'Summer2027-Internships', category: 'Internships', description: 'Maintained 2027 internship board with employer application links.', focus: 'Software, data, product and hardware' },
  { owner: 'speedyapply', name: '2027-SWE-College-Jobs', category: 'Internships', description: 'Current 2027 software internship and early career postings.', focus: 'Software engineering' },
  { owner: 'hazratali', name: 'awesome-ai-summerschool', category: 'Summer schools', description: 'AI and machine learning schools with individual program links.', focus: 'AI and machine learning' },
  { owner: 'karanwxliaa', name: 'Research-for-UG-Students', category: 'Research', description: 'Undergraduate research programs with program destinations.', focus: 'Undergraduate research' },
  { owner: 'zapplyjobs', name: 'Research-Internships-for-Undergraduates', category: 'Research', description: 'Undergraduate research internship program directory.', focus: 'Undergraduate research' },
  { owner: 'suco-gt', name: 'HPC-Internships', category: 'Research', description: 'High performance computing internship and fellowship programs.', focus: 'Computing research' },
].map((source) => ({ ...source, url: `https://github.com/${source.owner}/${source.name}` }));

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

fs.writeFileSync(data('repositories.json'), `${JSON.stringify(sources, null, 2)}\n`);
fs.writeFileSync(data('initialOpportunities.json'), `${JSON.stringify(curated, null, 2)}\n`);
fs.writeFileSync(data('initialLogs.json'), '[]\n');
console.log(`Curated ${curated.length} usable leads from ${sources.length} sources.`);
