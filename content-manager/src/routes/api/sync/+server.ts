import { json, type RequestHandler } from '@sveltejs/kit';
import { syncAccount } from '$lib/server/sync';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const account = body.account || 'copiumbuilder';
    const force = Boolean(body.force);

    const result = await syncAccount(account, force);
    return json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    return json({ success: false, updated: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    const account = url.searchParams.get('account') || 'copiumbuilder';
    const force = url.searchParams.get('force') === 'true';

    const result = await syncAccount(account, force);
    return json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    return json({ success: false, updated: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
};
