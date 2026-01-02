import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { Role } from "@prisma/client";
import { roleAccessMap } from "@/lib/rbac/roles";
import { Middleware } from "./chain";
import { betterFetch } from "@better-fetch/fetch";
import { Session } from "@/lib/auth";

// RBAC Middleware
export const routeMiddleware: Middleware = async (req, _event, next) => {
  const path = req.nextUrl.pathname;

  // Get the user data from a secure HTTP-only cookie
  const user = getSessionCookie(req)?.split(".")[0];

  const { data: session, error } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    }
  );

  function getToken(data: Session) {
    if (data.session.token === user) {
      return data.user.role;
    }
  }

  // Define protected routes and required roles

  // Check if the path is protected
  for (const [routes, allowedRoles] of Object.entries(roleAccessMap)) {
    if (path.startsWith(routes) && session) {
      // If user is not logged in, redirect to login
      if (!user) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      // If user doesn't have the required role, redirect to unauthorized page
      const role = getToken(session);
      if (!allowedRoles.includes(role as Role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return next();
};
