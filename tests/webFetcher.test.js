import test from 'node:test';
import assert from 'node:assert/strict';
import { isComputingOpportunity, parseFor9aOpportunity, parseWeWorkRemotelyFeed, parseWordPressPost } from '../scripts/webFetcher.js';

const source = {
  id: 'globalsouthopportunities.com',
  name: 'Global South Opportunities',
  category: 'Tech opportunities',
};

test('WordPress import retains the details and application destination from a computing article', () => {
  const post = {
    title: { rendered: 'Software Engineering Internship 2027' },
    link: 'https://www.globalsouthopportunities.com/software-internship-2027/',
    date: '2026-10-10T12:00:00',
    content: { rendered: `
      <p>Join the engineering team to build cloud services.</p>
      <p><strong>Host Company:</strong> Example Labs</p>
      <p><strong>Location:</strong> Berlin, Germany</p>
      <h2>Eligibility</h2><p>Students studying computer science may apply.</p>
      <h2>Benefits</h2><p>A monthly stipend and relocation support are provided.</p>
      <h2>Application Deadline</h2><p>15th December 2026</p>
      <h2>How to Apply</h2><p>Submit your CV online.</p>
      <a href="https://careers.examplelabs.com/internship/123">Apply now</a>
    ` },
  };
  const item = parseWordPressPost(post, source);
  assert.equal(item.host, 'Example Labs');
  assert.equal(item.location, 'Berlin, Germany');
  assert.equal(item.deadline, '2026-12-15');
  assert.match(item.eligibility, /computer science/);
  assert.match(item.benefits, /relocation support/);
  assert.match(item.howToApply, /Submit your CV/);
  assert.equal(item.applicationUrl, 'https://careers.examplelabs.com/internship/123');
  assert.equal(item.sourceRepo, source.id);
});

test('general youth programming articles do not count as computing opportunities', () => {
  assert.equal(isComputingOpportunity('Youth Leadership Internship', 'The program offers youth leadership programming.'), false);
});

test('For9a import keeps computing details and rejects unrelated application links', () => {
  const opportunity = {
    id: 123,
    title: 'Data Science Scholarship',
    url: 'https://www.for9a.com/en/opportunity/data-science-scholarship',
    deadline: '2099-12-31',
    organization: { name: 'Example University' },
    category: { name: 'Scholarships' },
    country: { place: { name: 'Germany' } },
    fundingType: { name: 'Fully funded' },
    descriptions: [
      { header: 'Description', body: '<p>Study data science and machine learning.</p>' },
      { header: 'Eligibility', body: '<p>Open to computer science graduates.</p>' },
      { header: 'Benefits', body: '<p>Tuition and living costs.</p>' },
    ],
  };
  const item = parseFor9aOpportunity(opportunity, { official_link: 'https://unrelated.example.org/other-job', how_to_apply: '<p>Apply with a CV.</p>' });
  assert.equal(item.applicationUrl, '');
  assert.equal(item.location, 'Germany');
  assert.match(item.eligibility, /graduates/);
  assert.match(item.benefits, /living costs/);
  assert.match(item.howToApply, /Apply with a CV/);
  assert.equal(parseFor9aOpportunity({ ...opportunity, closed: true }), null);
});

test('We Work Remotely RSS keeps active jobs with their region and original listing links', () => {
  const source = { id: 'weworkremotely.com', name: 'We Work Remotely', category: 'Remote jobs' };
  const xml = `<rss><channel>
    <item><title>Example Labs: Software Engineer</title><region>Anywhere in the World</region>
      <category>Programming</category><type>Full-Time</type><skills>React, APIs</skills>
      <description>&lt;p&gt;&lt;strong&gt;Headquarters:&lt;/strong&gt; Paris&lt;/p&gt;&lt;p&gt;Build cloud products.&lt;/p&gt;</description>
      <pubDate>Wed, 28 Oct 2026 10:00:00 +0000</pubDate><expires_at>Sat, 28 Nov 2026 10:00:00 +0000</expires_at>
      <guid>https://weworkremotely.com/remote-jobs/example-labs-software-engineer</guid></item>
    <item><title>Old Co: Old Job</title><region>USA Only</region><expires_at>Tue, 01 Jan 2020 00:00:00 +0000</expires_at>
      <guid>https://weworkremotely.com/remote-jobs/old-co-old-job</guid></item>
  </channel></rss>`;
  const items = parseWeWorkRemotelyFeed(xml, source, new Date('2026-10-29T00:00:00Z'));
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Software Engineer');
  assert.equal(items[0].host, 'Example Labs');
  assert.equal(items[0].location, 'Remote · Anywhere in the World');
  assert.equal(items[0].type, 'Job');
  assert.equal(items[0].sourceRepo, source.id);
  assert.equal(items[0].url, 'https://weworkremotely.com/remote-jobs/example-labs-software-engineer');
  assert.equal(items[0].summary, 'Build cloud products.');
  assert.match(items[0].notes, /Full-Time/);
  assert.equal(items[0].deadline, '');
  assert.throws(() => parseWeWorkRemotelyFeed('<html>not RSS</html>', source), /invalid RSS/);
});
