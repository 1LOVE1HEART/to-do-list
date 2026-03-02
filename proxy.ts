import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdmin = (session?.user as any)?.role === "admin";

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isApiAdmin = nextUrl.pathname.startsWith("/api/admin");

  // Admin routes
  if ((isAdminPage || isApiAdmin) && !isAdmin) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL("/login", nextUrl.origin));
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // Protected app routes
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
