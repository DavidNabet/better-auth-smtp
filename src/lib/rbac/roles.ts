import "server-only";
import { Role } from "@prisma/client";

/* export const roleAccessMap: Record<Role, string[]> = {
  SUPER_ADMIN: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/orgs",
    "/dashboard/apps",
    "/dashboard/apps/[id]",
    "/dashboard/team",
    "/dashboard/manage-users",
  ],
  OWNER: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/orgs",
    "/dashboard/orgs/[id]",
    "/dashboard/apps",
    "/dashboard/apps/[id]",
    "/dashboard/team",
  ],
  ADMIN: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/orgs/[id]",
    "/dashboard/apps",
    "/dashboard/apps/[id]",
    "/dashboard/team",
  ],
  MEMBER: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/orgs/[id]",
    "/dashboard/apps/[id]",
  ],
  USER: ["/dashboard", "/dashboard/profile", "/dashboard/apps"],
}; */

export const roleAccessMap: Record<string, Role[]> = {
  "/dashboard": ["SUPER_ADMIN", "ADMIN", "OWNER", "MEMBER", "USER"],
  "/dashboard/profile": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER", "USER"],
  "/dashboard/orgs": ["SUPER_ADMIN", "OWNER", "ADMIN"],
  "/dashboard/orgs/[slug]": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER"],
  "/dashboard/apps": ["SUPER_ADMIN", "ADMIN", "OWNER", "MEMBER", "USER"],
  "/dashboard/apps/[slug]": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER", "USER"],
  "/dashboard/feedbacks": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER", "USER"],
  "/dashboard/feedbacks/[slug]": [
    "SUPER_ADMIN",
    "OWNER",
    "ADMIN",
    "MEMBER",
    "USER",
  ],
  "/dashboard/team": ["SUPER_ADMIN", "OWNER", "ADMIN"],
  "/dashboard/manage-users": ["SUPER_ADMIN"],
  // P1.3 — routes admin auparavant protégées par authn seulement, pas par rôle.
  "/dashboard/users/admin": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/users/super_admin": ["SUPER_ADMIN"],
};

// export function doesRoleHaveAccessToURL(role: Role, url: string) {
//   const accessibleRoutes = roleAccessMap[role] || [];
//   return accessibleRoutes.some((route) => {
//     const regexPattern = route.replace(/\[.*?\]/g, "[^/]+").replace("/", "\\/");
//     const regex = new RegExp(`^${regexPattern}$`);
//     return regex.test(url);
//   });
// }
