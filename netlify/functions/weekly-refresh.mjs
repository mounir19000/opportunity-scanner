// Run each Sunday at 06:17 UTC (07:17 in Algeria).
export const config = { schedule: '17 6 * * 0' };

export default async function weeklyRefresh() {
  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!buildHookUrl) {
    throw new Error('NETLIFY_BUILD_HOOK_URL is not configured for this site.');
  }

  const response = await fetch(buildHookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Netlify build hook returned HTTP ${response.status}.`);
  }
  console.log('Queued the weekly opportunity snapshot build.');
}
