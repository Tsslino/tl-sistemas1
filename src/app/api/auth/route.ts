import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    // Troque por validação real (DB, etc.)
    if (username === "admin" && password === "123456") {
      const res = NextResponse.json({ ok: true }, { status: 200 });
      // Opcional: cookie de sessão
      res.cookies.set("session", "token-qualquer", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
      return res;
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
