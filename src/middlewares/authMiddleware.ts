import { Middleware } from "./chain";
import { NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { Session } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";

export const authMiddleware: Middleware = async (req, _event, next) => {
  const routes = ["/auth/signin", "/auth/signup", "/auth/two-factor"];
  const adminRoute = ["/dashboard/users/admin", "/dashboard/users/super_admin"];
  const root = ["/"];

  const { nextUrl } = req;
  const isAuthRoute = routes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoute.includes(nextUrl.pathname);
  const isRoot = root.includes(nextUrl.pathname);
  const sessionCookie = getSessionCookie(req);

  const { error, data } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: req.nextUrl.origin,
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
    credentials: "include",
  });

  if (error) {
    console.log("betterFetch Error: ", error);
  }

  // P1.3 — présence d'un cookie != session valide.
  // Un cookie expiré/invalide ne satisfait plus le garde.
  const haveAccess = !!sessionCookie;

  console.log("sessionCookie: ", sessionCookie?.split(".")[0]);

  if (isRoot) {
    console.log("root");
    return NextResponse.redirect(new URL("/auth/signin", nextUrl.origin));
  }
  if (isAuthRoute) {
    if (haveAccess) {
      console.log("logged in");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!haveAccess && nextUrl.pathname.startsWith("/dashboard")) {
    console.log("not logged in");
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  if (haveAccess) {
    // if (!haveAccess) {
    //   return NextResponse.redirect(new URL("/dashboard", req.url));
    // }
    return NextResponse.next();
  }

  // empeche l'infinite loop
  if (haveAccess && isAdminRoute) {
    return NextResponse.next();
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

  return next();
};
