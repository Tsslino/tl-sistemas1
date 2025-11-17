import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Replace with real validation (DB, etc.)
    if (username === 'admin' && password === '123456') {
      const res = NextResponse.json({ ok: true }, { status: 200 });
      // Optional: session cookie
      res.cookies.set('session', 'token-qualquer', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60,
      });
      return res;
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
