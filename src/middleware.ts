import { NextResponse, NextFetchEvent } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

/**
 * L'admin a accès à certaines routes, le user non !
 * Pour comparer un admin d'un user, soit on met un userId param, soit on crée un accessToken** encoded qui est stocké dans le cookie et dont le role est soit user soit admin.
 * On peut également créer une fonction custom getSession qui ira cherche le role du userbyid
 *
 * **accessToken** encoded est un token qui est stocké dans le cookie et qui contient le userId, l'email et le role
 * On pourra créer un portage avec une invitation par email d'un user qui pointera sur un magicLink dont le token contient le userId, l'email et le role
 */

export async function middleware(req: NextRequest) {
  const routes = ["/auth/signin", "/auth/signup"];
  const adminRoute = ["/admin"];

  const root = ["/"];
  const { nextUrl } = req;
  const response = NextResponse.next();
  const isAuthRoute = routes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoute.includes(nextUrl.pathname);
  const isRoot = root.includes(nextUrl.pathname);

  // const { data, error } = await betterFetch<Session>("/api/auth/get-session", {
  //   baseURL: process.env.NEXT_PUBLIC_APP_URL,
  //   headers: {
  //     cookie: req.headers.get("cookie") || "",
  //   },
  // });

  const authRoutes = routes.some((route) => nextUrl.pathname.startsWith(route));
  const sessionCookie = getSessionCookie(req);

  if (isRoot) {
    console.log("root");
    return NextResponse.redirect(new URL("/auth/signin", nextUrl.origin));
  }

  // Redirect to dashboard if user is authenticated and trying to access auth routes
  if (sessionCookie) {
    console.log("logged in");
    if (nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (sessionCookie) {
    if (isAuthRoute) {
      console.log("not logged in and isAuthRoute");
      return response;
    }
    console.log("not logged in");

    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // if (isAdminRoute && data?.user.role !== "admin") {
  //   return NextResponse.redirect(new URL("/auth/signin", req.url));
  // }

  return response;
}

export const config = {
  // exclude routes
  matcher: ["/", "/((?!api|dashboard|_next/static|_next/image|favicon.ico).*)"],
};
