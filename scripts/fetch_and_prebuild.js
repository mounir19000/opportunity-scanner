import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchRepositoryOpportunities } from '../src/services/githubFetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reposPath = path.join(__dirname, '../src/data/repositories.json');
const outputPath = path.join(__dirname, '../src/data/initialOpportunities.json');
const logsOutputPath = path.join(__dirname, '../src/data/initialLogs.json');

const reposData = JSON.parse(fs.readFileSync(reposPath, 'utf-8'));
const repositories = Array.isArray(reposData) ? reposData : (reposData.repositories || []);

console.log(`Starting pre-build fetch across ${repositories.length} curated repositories...`);

async function run() {
  const allOpportunities = [];
  const allLogs = [];
  const existingIds = new Set();

  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i];
    console.log(`[${i + 1}/${repositories.length}] Ingesting: ${repo.owner}/${repo.name}...`);

    try {
      const { opportunities, log } = await fetchRepositoryOpportunities(repo);
      allLogs.push(log);

      let added = 0;
      for (const opp of opportunities) {
        if (!existingIds.has(opp.id)) {
          existingIds.add(opp.id);
          allOpportunities.push(opp);
          added++;
        }
      }

      console.log(`  -> Status: ${log.status} (HTTP ${log.statusCode}) | Extracted: ${added} items`);
    } catch (err) {
      console.error(`  -> Failed: ${err.message}`);
      allLogs.push({
        id: `log_${Date.now()}_${i}`,
        repo: `${repo.owner}/${repo.name}`,
        repoName: repo.name,
        repoOwner: repo.owner,
        url: repo.url,
        status: 'error',
        statusCode: 0,
        httpStatus: 0,
        durationMs: 0,
        itemsCount: 0,
        parsedCount: 0,
        error: err.message,
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Gentle delay to respect GitHub raw rate limits
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  console.log(`\nPre-build ingestion finished!`);
  console.log(`Total Opportunities Extracted: ${allOpportunities.length}`);
  console.log(`Total Logs Generated: ${allLogs.length}`);
  console.log(`Successful Repos: ${allLogs.filter((l) => l.status === 'success').length}`);
  console.log(`Errored Repos: ${allLogs.filter((l) => l.status === 'error').length}`);

  fs.writeFileSync(outputPath, JSON.stringify(allOpportunities, null, 2));
  fs.writeFileSync(logsOutputPath, JSON.stringify(allLogs, null, 2));

  console.log(`Saved datasets to:`);
  console.log(`- ${outputPath}`);
  console.log(`- ${logsOutputPath}`);
}

run();
