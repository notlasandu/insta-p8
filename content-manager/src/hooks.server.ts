import { redirect, type Handle } from '@sveltejs/kit';
import { verifyGateToken } from '$lib/gate';

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  if (pathname.startsWith('/api') || pathname.startsWith('/gate')) {
    return resolve(event);
  }

  const isProtected = pathname.startsWith('/a/') || pathname === '/a' || pathname.startsWith('/content/') || pathname === '/content';

  if (isProtected) {
    const cookieToken = event.cookies.get('dashboard_gate_session');
    const queryToken = event.url.searchParams.get('gate_token');
    const token = cookieToken || queryToken;
    const isValid = await verifyGateToken(token);

    if (!isValid) {
      throw redirect(303, `/gate?redirect=${encodeURIComponent(pathname + event.url.search)}`);
    }

    if (!cookieToken && queryToken) {
      event.cookies.set('dashboard_gate_session', queryToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
      });
    }
  }

  return resolve(event);
};
