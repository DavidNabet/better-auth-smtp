import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { roleAccessMap } from "@/lib/rbac/roles";
import { Middleware } from "./chain";
import { betterFetch } from "@better-fetch/fetch";
import { Session } from "@/lib/auth";

// RBAC Middleware
export const routeMiddleware: Middleware = async (req, _event, next) => {
  const path = req.nextUrl.pathname;

  // Session validée côté serveur (betterFetch vers /api/auth/get-session).
  const { data: session, error } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    },
  );

  // P1.3 — le rôle vient de la session validée (de confiance),
  // on supprime la comparaison fragile getSessionCookie(req)?.split(".")[0].
  for (const [routes, allowedRoles] of Object.entries(roleAccessMap)) {
    if (path.endsWith(routes) && session) {
      if (!allowedRoles.includes(session.user.role as Role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return next();
};
