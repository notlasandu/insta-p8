import { json, type RequestHandler } from '@sveltejs/kit';
import { getExpectedPasscode, hashPasscode } from '$lib/gate';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { passcode } = await request.json();
    const expected = getExpectedPasscode();

    if (!passcode || passcode.trim() !== expected.trim()) {
      return json({ error: 'Invalid passcode' }, { status: 401 });
    }

    const token = await hashPasscode(passcode.trim());

    cookies.set('dashboard_gate_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return json({ success: true, token });
  } catch {
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete('dashboard_gate_session', { path: '/' });
  return json({ success: true });
};
