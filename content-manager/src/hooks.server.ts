import { redirect, type Handle } from '@sveltejs/kit';
import { verifyGateToken } from '$lib/gate';

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  if (pathname.startsWith('/a') || pathname.startsWith('/content')) {
    const sessionCookie = event.cookies.get('dashboard_gate_session');
    const isValid = await verifyGateToken(sessionCookie);

    if (!isValid) {
      throw redirect(303, `/gate?redirect=${encodeURIComponent(pathname + event.url.search)}`);
    }
  }

  return resolve(event);
};
