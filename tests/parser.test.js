import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownTable } from '../src/services/githubFetcher.js';
import { normalizeOpportunity } from '../src/services/opportunityData.js';

test('table parser keeps its header when a program title contains header words', () => {
  const markdown = [
    'Name | Venue | Date | Deadline ⏰ | Organizers | Fee 💶 | Scholarship 💧',
    '--- | --- | --- | --- | --- | --- | ---',
    '[Research Program 2027](https://school.example/apply) | Paris, France | 10 – 15 July 2027 | 12 November 2026 | University A | 400 EUR | Travel grant available',
    '[Another School 2027](https://other.example/apply) | Berlin, Germany | 1 – 5 August 2027 | 30 January 2027 | University B | Free | N/A',
  ].join('\n');
  const repo = { owner: 'example', name: 'schools', category: 'Summer schools', url: 'https://github.com/example/schools' };
  const parsed = parseMarkdownTable(markdown, repo).map(normalizeOpportunity);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].deadline, '12 November 2026');
  assert.equal(parsed[0].dates, '10 – 15 July 2027');
  assert.equal(parsed[0].stipend, 'Travel grant available · 400 EUR');
  assert.equal(parsed[1].deadline, '30 January 2027');
  assert.equal(parsed[1].stipend, 'Free');
});
