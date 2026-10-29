import * as cheerio from 'cheerio';
import { inferType } from '../src/services/githubFetcher.js';
import { dedupeOpportunities, explicitDate, isUsefulOpportunity, normalizeOpportunity, sourceKey } from '../src/services/opportunityData.js';

const TECH = /\b(?:computer science|computer engineering|software(?: engineering| development)?|developer|web development|machine learning|deep learning|artificial intelligence|AI|data science|data engineering|cyber\s*security|information technology|information and communication (?:technology|science)|informatics|robotics|cloud computing|embedded systems?|microelectronics|semiconductor|digital technology|digital sciences?|fintech|blockchain|quantum computing|computational science|bioinformatics|geospatial|geoinformatics|GIS|Google Earth Engine|HPC|IT internship)\b/i;
const TITLE_TECH = /\b(?:programming|coding|programmer)\b/i;
const OPPORTUNITY = /\b(?:scholarship|internship|fellowship|research|school|training|course|competition|hackathon|grant|job|traineeship|program(?:me)?|camp|award|conference|position)\b/i;
const SEARCH_TERMS = [
  'computer science', 'software engineering', 'programming', 'machine learning',
  'artificial intelligence', 'data science', 'cybersecurity', 'information technology',
  'informatics', 'robotics', 'cloud computing', 'computer engineering',
  'microelectronics', 'bioinformatics', 'fintech',
];
const FOR9A_QUERY = `query($first:Int!,$page:Int!,$term:String,$type:OpportunitySection!){
  opportunities(first:$first,page:$page,input:{type:$type,term:$term}){
    paginatorInfo{total hasMorePages currentPage}
    data{id title url deadline closed no_deadline publish_date is_remote job_type
      tags{keyword} category{name} organization{name} fundingType{name}
      country{place{name}} locations{name}}
  }
}`;
const FOR9A_DETAIL_QUERY = `query($id:Int!,$type:OpportunitySection!){
  opportunity(id:$id,type:$type){id title url deadline closed no_deadline publish_date is_remote
    expiry_status duration redirect_url descriptions{header body}
    applicant_criteria{label value} opportunity_criteria{label value}
    tags{keyword} category{name} organization{name} fundingType{name}
    country{place{name}} locations{name}}
}`;
const WWR_CATEGORY_FEEDS = [
  'remote-customer-support-jobs', 'remote-product-jobs',
  'remote-full-stack-programming-jobs', 'remote-back-end-programming-jobs',
  'remote-front-end-programming-jobs', 'remote-programming-jobs',
  'remote-sales-and-marketing-jobs', 'remote-management-and-finance-jobs',
  'remote-design-jobs', 'remote-devops-sysadmin-jobs', 'all-other-remote-jobs',
];

export function isComputingOpportunity(title, body = '') {
  return TECH.test(title) || TITLE_TECH.test(title) || (OPPORTUNITY.test(title) && TECH.test(body));
}

function compact(value, limit = 900) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const cut = text.lastIndexOf(' ', limit);
  return text.slice(0, cut > limit * 0.65 ? cut : limit).trim() + '…';
}

function textFromHtml(html) {
  const $ = cheerio.load(String(html || '').replace(/<br\s*\/?\s*>|<\/(?:p|li|div|h[1-6])>/gi, ' $&'));
  $('script,style,noscript').remove();
  return compact($.root().text(), 100000);
}

async function request(url, options = {}) {
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const serverHeaders = typeof window === 'undefined'
        ? { 'User-Agent': 'OpportunityScanner/1.0 (public opportunity index)' }
        : {};
      const response = await fetch(url, {
        ...options,
        headers: { ...serverHeaders, Accept: 'application/json, text/html', ...options.headers },
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return response;
    } catch (caught) {
      error = caught;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw error;
}

async function graphql(endpoint, query, variables = {}) {
  const response = await request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', lang: 'en', ...(typeof window === 'undefined' ? { Origin: 'https://www.for9a.com' } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map((item) => item.message).join('; '));
  return payload.data;
}

function articleSections(html) {
  const $ = cheerio.load(html || '');
  $('script,style,noscript').remove();
  $('p').filter((_, node) => /^\s*(also check|for more opportunities|join our|follow us)/i.test($(node).text())).remove();
  const sections = [];
  $('h2,h3,h4').each((_, heading) => {
    const label = compact($(heading).text(), 150);
    const content = $(heading).nextUntil('h2,h3,h4').map((_, node) => $(node).text()).get().join(' ');
    if (label) sections.push({ label, text: compact(content, 3000) });
  });
  const paragraphs = $('p').map((_, node) => compact($(node).text(), 1200)).get().filter(Boolean);
  const listItems = $('li').map((_, node) => compact($(node).text(), 1200)).get().filter(Boolean);
  return { $, sections, paragraphs, listItems, text: textFromHtml($.root().html()) };
}

function section(sections, pattern, limit = 900) {
  const match = sections.find((entry) => pattern.test(entry.label));
  return compact(match?.text, limit);
}

function labeled(text, labels, limit = 140) {
  const match = text.match(new RegExp(`(?:^|[\\n.])\\s*(?:${labels})\\s*:\\s*([^\\n.]{3,180})`, 'i'));
  return compact(match?.[1] || '', limit);
}

function dateFromText(value) {
  const date = explicitDate(String(value || '').replace(/\b(\d{1,2})(?:st|nd|rd|th)\b/gi, '$1'));
  return date ? date.toISOString().slice(0, 10) : '';
}

function extractDeadline(sections, paragraphs, listItems) {
  const candidates = [
    ...sections.filter((entry) => /deadline|last date|application period/i.test(entry.label)).map((entry) => entry.text),
    ...listItems.filter((item) => /deadline|last date|apply by|applications? (?:close|open until)|open all year/i.test(item)),
    ...paragraphs.filter((p) => /deadline|last date|apply by|applications? (?:close|open until)|open all year/i.test(p)),
  ];
  for (const candidate of candidates) {
    const date = dateFromText(candidate);
    if (date) return date;
  }
  if (candidates.some((candidate) => /\b(?:open all year|rolling|no deadline)\b/i.test(candidate))) return 'Rolling';
  return '';
}

function htmlLabel($, labels) {
  const pattern = new RegExp(`^(?:${labels})\\s*:?$`, 'i');
  let found = '';
  $('strong,b').each((_, node) => {
    if (found || !pattern.test(compact($(node).text(), 100))) return;
    let next = node.nextSibling;
    const chunks = [];
    while (next && next.type === 'text') {
      chunks.push(next.data);
      next = next.nextSibling;
    }
    found = compact(chunks.join(' ').replace(/^\s*:\s*/, ''), 180);
  });
  return found;
}

function applicationLink($, sourceUrl) {
  const host = new URL(sourceUrl).hostname.replace(/^www\./, '');
  const links = $('a[href]').map((_, anchor) => {
    const text = compact($(anchor).text(), 160);
    try {
      const url = new URL($(anchor).attr('href'), sourceUrl);
      return { text, url: url.toString(), external: !url.hostname.replace(/^www\./, '').endsWith(host) };
    } catch { return null; }
  }).get().filter(Boolean);
  const valid = links.filter(({ url }) => /^https?:/.test(url) && !/facebook|instagram|twitter|whatsapp|linkedin|youtube|t\.me/.test(new URL(url).hostname));
  return valid.find(({ text, external }) => external && /(?:visit|official|apply|application portal|register|registration|enrol|enroll|sign up)/i.test(text))?.url
    || valid.find(({ text, external }) => external && /(?:apply|application|register|registration|enrol|enroll)/i.test(text))?.url || '';
}

export function parseWordPressPost(post, source, categories = {}) {
  const title = textFromHtml(post.title?.rendered);
  const html = post.content?.rendered || '';
  const { $, sections, paragraphs, listItems, text } = articleSections(html);
  const relevantText = [
    ...paragraphs.slice(0, 3),
    ...sections.filter((entry) => /field|area|topic|project|research|eligibility|requirements|speciali[sz]ation|discipline|subject|position|who can apply|science and technology|stem/i.test(entry.label)).map((entry) => entry.label + ' ' + entry.text),
  ].join(' ');
  if (!isComputingOpportunity(title, relevantText)) return null;
  const category = post.categories?.map((id) => categories[id]).find((name) => name && !/^(?:GSO|Uncategorized)$/i.test(name)) || source.category;
  const deadline = extractDeadline(sections, paragraphs, listItems);
  const host = htmlLabel($, 'Host(?: (?:Organisation|Organization|University|Company|Institution))?|Organisation|Organization|University|Company|Organizer|Employer|Institution|Provider')
    || labeled(text, 'Host(?: (?:Organisation|Organization|University|Company|Institution))?|Organisation|Organization|University|Company|Organizer|Employer|Institution|Provider');
  const location = htmlLabel($, 'Host Country|Program Location|Locations?|Country')
    || labeled(text, 'Host Country|Program Location|Locations?|Country');
  const duration = htmlLabel($, 'Duration|Program Dates|Internship Dates|Course Duration')
    || labeled(text, 'Duration|Program Dates|Internship Dates|Course Duration');
  const benefits = section(sections, /benefits|financial coverage|funding|salary|stipend|what (?:will|you) learn/i, 3000);
  const eligibility = section(sections, /eligibility|requirements|who can apply|who should/i, 3000);
  const howToApply = section(sections, /how to apply|application process|how to register|registration process|how to enrol|how to enroll/i, 3000);
  const summary = compact(paragraphs.slice(0, 2).join(' '), 450);
  const stipend = htmlLabel($, 'Financial Coverage|Monthly Stipend|Salary|Stipend')
    || labeled(text, 'Financial Coverage|Monthly Stipend|Salary|Stipend', 180)
    || (/fully funded/i.test(title) ? 'Fully funded' : '');
  const item = {
    title, host, category, type: inferType(title, category), location, deadline,
    dates: duration, stipend, summary, benefits, eligibility, howToApply,
    applicationUrl: applicationLink($, post.link), sourceUrl: post.link, url: post.link,
    publishedAt: post.date || '', notes: '', sourceRepo: sourceKey(source),
    discoveredAt: new Date().toISOString(),
  };
  return isUsefulOpportunity(item) ? normalizeOpportunity(item) : null;
}

async function fetchWordPressCategories(source) {
  const url = new URL(source.apiUrl.replace(/\/posts$/, '/categories'));
  url.searchParams.set('per_page', '100');
  url.searchParams.set('_fields', 'id,name');
  const rows = await (await request(url)).json();
  return Object.fromEntries(rows.map((row) => [row.id, textFromHtml(row.name)]));
}

export async function fetchWordPressSource(source, { samplePages = 0, since: sinceOption } = {}) {
  const started = Date.now();
  const categories = await fetchWordPressCategories(source);
  const since = sinceOption ? new Date(sinceOption) : new Date();
  if (Number.isNaN(since.getTime())) throw new Error('Invalid WordPress refresh date');
  if (!sinceOption) since.setUTCFullYear(since.getUTCFullYear() - 2);
  const urlFor = (page) => {
    const url = new URL(source.apiUrl);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('after', since.toISOString().slice(0, 19));
    url.searchParams.set('_fields', 'id,date,link,title,content,categories,tags');
    return url;
  };
  const firstResponse = await request(urlFor(1));
  const firstPosts = await firstResponse.json();
  const totalPages = Number(firstResponse.headers.get('X-WP-TotalPages') ?? (firstPosts.length ? 1 : 0));
  if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > 200) throw new Error(`Unexpected WordPress page count: ${totalPages}`);
  const pages = samplePages ? Math.min(totalPages, samplePages) : totalPages;
  const items = [];
  let scanned = 0;
  const add = (posts) => {
    scanned += posts.length;
    for (const post of posts) {
      const item = parseWordPressPost(post, source, categories);
      if (item) items.push(item);
    }
  };
  add(firstPosts);
  for (let page = 2; page <= pages; page += 3) {
    const batch = await Promise.all(Array.from({ length: Math.min(3, pages - page + 1) }, (_, i) => request(urlFor(page + i)).then((r) => r.json())));
    batch.forEach(add);
    if (page % 12 === 2) console.log(`${source.name}: scanned ${scanned} posts on ${Math.min(pages, page + 2)}/${pages} pages`);
  }
  return {
    opportunities: items,
    log: { repo: sourceKey(source), repoName: source.name, url: source.url,
      status: 'success', itemsCount: items.length,
      parsedCount: scanned, statusCode: 200, durationMs: Date.now() - started,
      message: `Scanned ${scanned} public posts; retained ${items.length} computing leads`,
      timestamp: new Date().toISOString() },
  };
}

function for9aDescription(opportunity, label) {
  const entry = opportunity.descriptions?.find((part) => label.test(part.header || ''));
  return textFromHtml(entry?.body || '');
}

function trustedApplicationUrl(url, opportunity) {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return '';
    const haystack = (parsed.hostname + parsed.pathname).toLowerCase();
    const words = [opportunity.organization?.name, opportunity.title].join(' ').toLowerCase()
      .split(/[^a-z0-9]+/).filter((word) => word.length >= 5 && !/^(?:example|university|scholarship|internship|research|program|funded|students|international|opportunity|application|science|engineering|technology|computer|software|academy|training|course|online|fellowship|grant|summer|winter|award|jobs|degree|study)$/.test(word));
    return words.some((word) => haystack.includes(word)) ? parsed.toString() : '';
  } catch { return ''; }
}

export function parseFor9aOpportunity(opportunity, application = {}) {
  const title = compact(opportunity.title, 220);
  const description = for9aDescription(opportunity, /description/i);
  const tags = (opportunity.tags || []).map((tag) => tag.keyword).join(' ');
  const category = opportunity.category?.name || 'Opportunity';
  if (!isComputingOpportunity(title + ' ' + category, description + ' ' + tags)) return null;
  if (opportunity.closed || opportunity.expiry_status === 'closed') return null;
  const criteria = [...(opportunity.applicant_criteria || []), ...(opportunity.opportunity_criteria || [])];
  const criterion = (pattern) => criteria.filter((entry) => pattern.test(entry.label)).flatMap((entry) => entry.value || []).join(', ');
  const eligibility = for9aDescription(opportunity, /eligibility/i);
  const benefits = for9aDescription(opportunity, /benefit/i);
  const applicationUrl = trustedApplicationUrl(application.official_link || application.link || opportunity.redirect_url || '', opportunity);
  const deadline = opportunity.no_deadline ? 'Rolling' : opportunity.deadline || '';
  const location = (opportunity.locations || []).map((place) => place.name).filter(Boolean).join(', ')
    || opportunity.country?.place?.name || (opportunity.is_remote ? 'Remote' : '');
  const notes = [criterion(/nationality/i) && `Nationality: ${criterion(/nationality/i)}`,
    criterion(/degree|education/i) && `Education: ${criterion(/degree|education/i)}`].filter(Boolean).join(' · ');
  const item = {
    title, host: compact(opportunity.organization?.name, 130), category,
    type: inferType(title, category), location, deadline,
    dates: compact(opportunity.duration || '', 180),
    stipend: compact(opportunity.fundingType?.name || '', 160),
    summary: compact(description, 450), eligibility: compact(eligibility, 3000),
    benefits: compact(benefits, 3000), howToApply: compact(textFromHtml(application.how_to_apply || ''), 3000),
    notes, applicationUrl, sourceUrl: opportunity.url, url: opportunity.url,
    publishedAt: opportunity.publish_date ? new Date(opportunity.publish_date * 1000).toISOString() : '',
    sourceRepo: 'for9a.com', discoveredAt: new Date().toISOString(),
  };
  return isUsefulOpportunity(item) ? normalizeOpportunity(item) : null;
}

async function for9aPage(source, type, page, term = null) {
  const data = await graphql(source.apiUrl, FOR9A_QUERY, { first: 100, page, term, type });
  if (!data?.opportunities?.paginatorInfo) throw new Error('For9a returned no pagination data');
  return data.opportunities;
}

async function for9aListingSet(source, type, term = null) {
  const first = await for9aPage(source, type, 1, term);
  const total = first.paginatorInfo.total;
  if (total > 10000) throw new Error(`Unexpected For9a result count: ${total}`);
  const rows = [...first.data];
  const pages = Math.ceil(total / 100);
  for (let page = 2; page <= pages; page++) {
    const next = await for9aPage(source, type, page, term);
    rows.push(...next.data);
  }
  return rows;
}

async function for9aDetail(source, row) {
  const data = await graphql(source.apiUrl, FOR9A_DETAIL_QUERY, { id: Number(row.id), type: row.section });
  if (!data?.opportunity) throw new Error(`For9a returned no details for ${row.id}`);
  return data.opportunity;
}

async function for9aApplications(source, ids) {
  const found = new Map();
  for (let offset = 0; offset < ids.length; offset += 20) {
    const batch = ids.slice(offset, offset + 20);
    const fields = batch.map((id, index) => `a${index}:applicationInfo(id:${Number(id)}){link official_link how_to_apply}`).join(' ');
    const data = await graphql(source.apiUrl, `query{${fields}}`);
    batch.forEach((id, index) => found.set(String(id), data[`a${index}`] || {}));
  }
  return found;
}

export async function fetchFor9aSource(source, { sampleDetails = 0 } = {}) {
  const started = Date.now();
  const all = new Map();
  const searchMatches = new Set();
  for (const type of ['EDU', 'JOBS']) {
    for (const row of await for9aListingSet(source, type)) all.set(String(row.id), { ...row, section: type });
    for (const term of SEARCH_TERMS) {
      for (const row of await for9aListingSet(source, type, term)) {
        all.set(String(row.id), { ...row, section: type });
        searchMatches.add(String(row.id));
      }
    }
  }
  const candidates = [...all.values()].filter((row) => !row.closed && (!row.deadline || !explicitDate(row.deadline) || explicitDate(row.deadline) >= new Date(new Date().toISOString().slice(0, 10)))
    && (searchMatches.has(String(row.id)) || isComputingOpportunity(row.title, (row.tags || []).map((tag) => tag.keyword).join(' '))));
  console.log(`For9a: ${candidates.length} possible computing leads among ${all.size} active listings`);
  const selected = sampleDetails ? candidates.slice(0, sampleDetails) : candidates;
  const detailed = [];
  for (let offset = 0; offset < selected.length; offset += 4) {
    const batch = selected.slice(offset, offset + 4);
    const results = await Promise.all(batch.map((row) => for9aDetail(source, row)));
    detailed.push(...results.filter(Boolean));
    if (offset % 40 === 0) console.log(`For9a: loaded ${detailed.length}/${selected.length} detail pages`);
  }
  const applications = await for9aApplications(source, detailed.map((item) => item.id));
  const items = detailed.map((item) => parseFor9aOpportunity(item, applications.get(String(item.id)))).filter(Boolean);
  return {
    opportunities: items,
    log: { repo: sourceKey(source), repoName: source.name, url: source.url,
      status: items.length ? 'success' : 'warning', itemsCount: items.length,
      parsedCount: all.size, statusCode: 200, durationMs: Date.now() - started,
      message: `Scanned ${all.size} public listings; loaded ${detailed.length} detail pages; retained ${items.length} computing leads`,
      timestamp: new Date().toISOString() },
  };
}

export function parseWeWorkRemotelyFeed(xml, source, today = new Date()) {
  const $ = cheerio.load(xml, { xmlMode: true });
  if (!$('rss > channel').length) throw new Error('We Work Remotely returned an invalid RSS feed');
  const items = [];
  $('channel > item').each((_, node) => {
    const entry = $(node);
    const field = (name) => entry.children(name).first().text().trim();
    const url = field('guid') || field('link');
    if (!/^https:\/\/weworkremotely\.com\/remote-jobs\/[^\s]+/i.test(url)) return;
    const expires = new Date(field('expires_at'));
    if (!Number.isNaN(expires.getTime()) && expires < today) return;
    const rawTitle = field('title');
    const colon = rawTitle.indexOf(': ');
    const host = colon > 0 ? rawTitle.slice(0, colon).trim() : '';
    const title = colon > 0 ? rawTitle.slice(colon + 2).trim() : rawTitle;
    const description = cheerio.load(field('description'));
    description('script,style,noscript').remove();
    description('p').first().filter((_, paragraph) => /\bHeadquarters\s*:/i.test(description(paragraph).text())).remove();
    const summary = compact(textFromHtml(description.root().html()), 550);
    const region = field('region');
    const country = field('country').replace(/^\p{Extended_Pictographic}\s*/u, '').trim();
    const location = region ? `Remote · ${region}` : country ? `Remote · ${country}` : 'Remote';
    const published = new Date(field('pubDate'));
    const item = {
      title, host, category: field('category') || source.category,
      type: 'Job', location, deadline: '', dates: '', stipend: '',
      summary, notes: [field('type'), field('skills')].filter(Boolean).join(' · '),
      applicationUrl: '', sourceUrl: url, url,
      publishedAt: Number.isNaN(published.getTime()) ? '' : published.toISOString(),
      sourceRepo: sourceKey(source), discoveredAt: new Date().toISOString(),
    };
    if (isUsefulOpportunity(item, today)) items.push(normalizeOpportunity(item));
  });
  return items;
}

export async function fetchWeWorkRemotelySource(source, { sampleFeeds = 0 } = {}) {
  const started = Date.now();
  const urls = [source.apiUrl, ...WWR_CATEGORY_FEEDS.map((slug) => `https://weworkremotely.com/categories/${slug}.rss`)];
  const selected = sampleFeeds ? urls.slice(0, sampleFeeds) : urls;
  const all = [];
  let scanned = 0;
  for (let offset = 0; offset < selected.length; offset += 3) {
    const batch = await Promise.all(selected.slice(offset, offset + 3).map(async (url) => {
      const xml = await (await request(url, { headers: { Accept: 'application/rss+xml, application/xml' } })).text();
      const parsed = parseWeWorkRemotelyFeed(xml, source);
      const count = (xml.match(/<item>/g) || []).length;
      return { parsed, count };
    }));
    for (const result of batch) {
      all.push(...result.parsed);
      scanned += result.count;
    }
  }
  const items = dedupeOpportunities(all);
  return {
    opportunities: items,
    log: { repo: sourceKey(source), repoName: source.name, url: source.url,
      status: items.length ? 'success' : 'warning', itemsCount: items.length,
      parsedCount: scanned, statusCode: 200, durationMs: Date.now() - started,
      message: `Scanned ${scanned} RSS entries across ${selected.length} feeds; retained ${items.length} current remote jobs`,
      timestamp: new Date().toISOString() },
  };
}

export function fetchWebSource(source, options = {}) {
  if (source.id === 'for9a.com') return fetchFor9aSource(source, options);
  if (source.id === 'weworkremotely.com') return fetchWeWorkRemotelySource(source, options);
  return fetchWordPressSource(source, options);
}
