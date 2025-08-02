import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import { Session } from "./lib/auth";
/**
 * L'admin a accès à certaines routes, le user non !
 * Pour comparer un admin d'un user, soit on met un userId param, soit on crée un accessToken** encoded qui est stocké dans le cookie et dont le role est soit user soit admin.
 * On peut également créer une fonction custom getSession qui ira cherche le role du userbyid
 *
 * **accessToken** encoded est un token qui est stocké dans le cookie et qui contient le userId, l'email et le role
 * On pourra créer un portage avec une invitation par email d'un user qui pointera sur un magicLink dont le token contient le userId, l'email et le role
 */

export async function middleware(req: NextRequest) {
  const routes = ["/auth/signin", "/auth/signup", "/auth/two-factor"];
  const adminRoute = ["/dashboard/users/admin", "/dashboard/users/moderator"];
  const role = ["ADMIN", "MODERATOR"];

  const root = ["/"];
  const { nextUrl } = req;
  const isAuthRoute = routes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoute.includes(nextUrl.pathname);
  const isRoot = root.includes(nextUrl.pathname);
  const sessionCookie = getSessionCookie(req);

  const { data: session, error } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    }
  );

  console.log("sessionCookie: ", sessionCookie);

  if (isRoot) {
    console.log("root");
    return NextResponse.redirect(new URL("/auth/signin", nextUrl.origin));
  }

  if (isAuthRoute) {
    if (sessionCookie) {
      console.log("logged in");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!sessionCookie && nextUrl.pathname.startsWith("/dashboard")) {
    console.log("not logged in");
    return Response.redirect(new URL("/auth/signin", nextUrl));
  }

  // Redirect to dashboard if user is authenticated and trying to access auth routes
  // if (sessionCookie) {
  //   console.log("logged in");
  //   if (nextUrl.pathname.startsWith("/auth")) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   }
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  // if (sessionCookie) {
  //   if (isAuthRoute) {
  //     console.log("not logged in and isAuthRoute");
  //     return response;
  //   }
  //   console.log("not logged in");

  //   return NextResponse.redirect(new URL("/auth/signin", req.url));
  // }

  if (sessionCookie && isAdminRoute && session?.user.role !== "USER") {
    console.log("not user");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // exclude routes
  matcher: ["/", "/((?!api|dashboard|_next/static|_next/image|favicon.ico).*)"],
};
