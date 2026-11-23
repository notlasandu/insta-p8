import { json, type RequestHandler } from '@sveltejs/kit';
import { syncAccount } from '$lib/server/sync';
import registry from '$lib/data/accounts_registry.json';

function checkAuth(request: Request, url: URL): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const queryKey = url.searchParams.get('key') || url.searchParams.get('secret');

  return bearerToken === cronSecret || queryKey === cronSecret;
}

async function handleSync(accountParam: string, force: boolean) {
  if (accountParam === 'all' || accountParam === '*') {
    const results = [];
    for (const acc of registry) {
      try {
        const res = await syncAccount(acc.id, force);
        results.push({ account: acc.id, ...res });
      } catch (err: any) {
        results.push({ account: acc.id, success: false, updated: false, error: err?.message || String(err) });
      }
    }
    const allSuccessful = results.every((r) => r.success);
    return { success: allSuccessful, count: results.length, results };
  }

  return await syncAccount(accountParam, force);
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const account = body.account || url.searchParams.get('account') || 'all';
    const force = Boolean(body.force || url.searchParams.get('force') === 'true');

    // Internal client-side dashboard sync calls pass a single account name without auth secret
    if (account === 'all' && !checkAuth(request, url)) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await handleSync(account, force);
    const status = (result as any).success ? 200 : 500;
    return json(result, { status });
  } catch (err: any) {
    return json({ success: false, updated: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ request, url }) => {
  if (!checkAuth(request, url)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const account = url.searchParams.get('account') || 'all';
    const force = url.searchParams.get('force') === 'true';

    const result = await handleSync(account, force);
    const status = (result as any).success ? 200 : 500;
    return json(result, { status });
  } catch (err: any) {
    return json({ success: false, updated: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
};
