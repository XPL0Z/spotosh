import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const { auth } = await import("./services/auth");

  const session = await auth();
  if (session === null) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("No session found, redirecting to login");
    const authUrl = new URL("/login", req.url);
    authUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|error|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z]+$).*)"],
};
