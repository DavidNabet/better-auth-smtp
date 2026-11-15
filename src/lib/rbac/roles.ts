import "server-only";
import { Role } from "@prisma/client";

export const roleAccessMap: Record<string, Role[]> = {
  "/dashboard/users/super_admin": ["SUPER_ADMIN"],
  "/dashboard/users/admin": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/orgs/[slug]": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER"],
  "/dashboard/orgs": ["SUPER_ADMIN", "OWNER", "ADMIN"],
  "/dashboard/manage-users": ["SUPER_ADMIN"],
  "/dashboard/team": ["SUPER_ADMIN", "OWNER", "ADMIN"],
  "/dashboard/apps/[slug]": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER", "USER"],
  "/dashboard/apps": ["SUPER_ADMIN", "ADMIN", "OWNER", "MEMBER", "USER"],
  "/dashboard/feedbacks/[slug]": [
    "SUPER_ADMIN",
    "OWNER",
    "ADMIN",
    "MEMBER",
    "USER",
  ],
  "/dashboard/feedbacks": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER", "USER"],
  "/dashboard/profile": ["SUPER_ADMIN", "OWNER", "ADMIN", "MEMBER", "USER"],
  "/dashboard": ["SUPER_ADMIN", "ADMIN", "OWNER", "MEMBER", "USER"],
};

// export function doesRoleHaveAccessToURL(role: Role, url: string) {
//   const accessibleRoutes = roleAccessMap[role] || [];
//   return accessibleRoutes.some((route) => {
//     const regexPattern = route.replace(/\[.*?\]/g, "[^/]+").replace("/", "\\/");
//     const regex = new RegExp(`^${regexPattern}$`);
//     return regex.test(url);
//   });
// }
