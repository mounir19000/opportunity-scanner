import test from 'node:test';
import assert from 'node:assert/strict';
import { isComputingOpportunity, parseFor9aOpportunity, parseWordPressPost } from '../scripts/webFetcher.js';

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
