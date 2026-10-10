import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchRepositoryOpportunities, parseMarkdownBullets, parseMarkdownTable } from '../src/services/githubFetcher.js';
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

test('position and posting columns use the job URL, not the company homepage', () => {
  const markdown = [
    '| Company | Position | Location | Salary | Posting | Age |',
    '| --- | --- | --- | --- | --- | --- |',
    '| <a href="https://www.pinterest.com"><strong>Pinterest</strong></a> | Software Engineer Intern 2027 - USA | Remote - San Francisco, CA | $52/hr | <a href="https://www.pinterestcareers.com/jobs/?gh_jid=7838577"><img src="https://i.imgur.com/apply.png" alt="Apply"/></a> | 2d |',
  ].join('\n');
  const repo = { owner: 'speedyapply', name: '2027-SWE-College-Jobs', category: 'Internships' };
  const parsed = parseMarkdownTable(markdown, repo);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].title, 'Software Engineer Intern 2027 - USA');
  assert.equal(parsed[0].host, 'Pinterest');
  assert.equal(parsed[0].url, 'https://www.pinterestcareers.com/jobs/?gh_jid=7838577');
  assert.equal(parsed[0].stipend, '$52/hr');
});

test('research-list bullets inherit their country heading and stop at resources', () => {
  const markdown = [
    '## Website & Autofill Extension',
    '- [Apply faster](https://example.com/marketing)',
    '## North America',
    '#### <img src="images/flags/us.png" alt="US flag"> USA',
    '* [LPI Summer Intern Program](https://example.com/lpi)',
    '#### Canada',
    '* [Alberta Research Experience](https://example.com/alberta)',
    '## Europe',
    '#### Germany',
    '* [Max Planck Summer Internship](https://example.com/max-planck)',
    '## Worldwide',
    '#### 🌍 Multiple Countries',
    '* [Amgen Scholars Program](https://example.com/amgen)',
    '#### 🗺️ Global Programs for Indian Students',
    '* [Viterbi India Program](https://example.com/viterbi)',
    '## More Resources',
    '* [Another job board](https://example.com/jobs)',
  ].join('\n');
  const repo = { owner: 'zapplyjobs', name: 'Research-Internships-for-Undergraduates', category: 'Research', locationFromHeadings: true };
  const parsed = parseMarkdownBullets(markdown, repo);
  assert.deepEqual(parsed.map((item) => [item.title, item.location]), [
    ['LPI Summer Intern Program', 'USA'],
    ['Alberta Research Experience', 'Canada'],
    ['Max Planck Summer Internship', 'Germany'],
    ['Amgen Scholars Program', 'Multiple countries'],
    ['Viterbi India Program', 'Varies by programme'],
  ]);
});

test('a configured source file is fetched without reading README or other files', async () => {
  const originalFetch = globalThis.fetch;
  const requested = [];
  const source = {
    owner: 'speedyapply',
    name: '2027-SWE-College-Jobs',
    branch: 'main',
    file: 'INTERN_INTL.md',
    category: 'Internships',
    url: 'https://github.com/speedyapply/2027-SWE-College-Jobs',
  };
  const rawUrl = 'https://raw.githubusercontent.com/speedyapply/2027-SWE-College-Jobs/main/INTERN_INTL.md';
  const markdown = '| Company | Position | Location | Posting | Age |\n| --- | --- | --- | --- | --- |\n| Example | Software Engineer Intern 2027 | London, UK | [Apply](https://example.com/jobs/123) | 1d |';

  try {
    globalThis.fetch = async (url) => {
      requested.push(url);
      return { ok: true, status: 200, text: async () => markdown };
    };
    const success = await fetchRepositoryOpportunities(source);
    assert.deepEqual(requested, [rawUrl]);
    assert.equal(success.opportunities.length, 1);
    assert.match(success.log.message, /main\/INTERN_INTL\.md/);

    requested.length = 0;
    globalThis.fetch = async (url) => {
      requested.push(url);
      return { ok: false, status: 404, statusText: 'Not Found' };
    };
    const missing = await fetchRepositoryOpportunities(source);
    assert.deepEqual(requested, [rawUrl]);
    assert.equal(missing.opportunities.length, 0);
    assert.equal(missing.log.status, 'error');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
