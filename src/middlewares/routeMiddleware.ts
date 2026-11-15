import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { roleAccessMap } from "@/lib/rbac/roles";
import { Middleware } from "./chain";
import { betterFetch } from "@better-fetch/fetch";
import { Session } from "@/lib/auth";
import { getValidatedSession } from "./session";

// Convert route patterns like "/dashboard/orgs/[slug]" to regex
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/\//g, "\\/")
    .replace(/\[([^\]]+)\]/g, "([^/]+)"); // [slug] -> ([^/]+)
  return new RegExp(`^${escaped}$`);
}

// Pre-compile regex patterns
const routePatterns = Object.entries(roleAccessMap).map(([pattern, roles]) => ({
  regex: patternToRegex(pattern),
  roles,
}));

// RBAC Middleware
export const routeMiddleware: Middleware = async (req, _event, next) => {
  const path = req.nextUrl.pathname;

  // Session validée côté serveur (betterFetch vers /api/auth/get-session).
  let session = null;
  const userId = req.headers.get("x-session-user-id");
  const role = req.headers.get("x-session-role");
  const orgId = req.headers.get("x-session-org-id");

  if (userId && role) {
    session = {
      userId: { id: userId, role: role as Role },
      activeOrganizationId: orgId || undefined,
    };
  } else {
    session = await getValidatedSession(req);
  }

  if (!session) return next();

  const userRole = session?.user?.role as Exclude<Role, "OWNER">;

  // Find matching route pattern (most specific first)
  for (const { regex, roles } of routePatterns) {
    if (regex.test(path)) {
      if (!roles.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      break; // First match wins (patterns ordered by specificity)
    }
  }

  // P1.3 — le rôle vient de la session validée (de confiance),
  // on supprime la comparaison fragile getSessionCookie(req)?.split(".")[0].
  // for (const [routes, allowedRoles] of Object.entries(roleAccessMap)) {
  //   allowedRoles.some((route) => {
  //     const regexPattern = route
  //       .replace(/\[.*?\]/g, "[^/]+")
  //       .replace("/", "\\/");
  //     const regex = new RegExp(`^${regexPattern}$`);
  //     if (regex.test(path) && session) {
  //       if (!allowedRoles.includes(session.user.role as Role)) {
  //         return NextResponse.redirect(new URL("/", req.url));
  //       }
  //     }
  //   });
  // }

  return next();
};
