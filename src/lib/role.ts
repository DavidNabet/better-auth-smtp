import "server-only";

export const roleAccessMap: Record<string, string[]> = {
  SUPER_ADMIN: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/organizations",
    "/dashboard/apps",
    "/dashboard/apps/[id]",
    "/dashboard/team",
    "/dashboard/manage-users",
  ],
  OWNER: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/organizations",
    "/dashboard/organizations/[id]",
    "/dashboard/apps",
    "/dashboard/apps/[id]",
    "/dashboard/team",
  ],
  ADMIN: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/organizations/[id]",
    "/dashboard/apps",
    "/dashboard/apps/[id]",
    "/dashboard/team",
  ],
  MEMBER: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/organizations/[id]",
    "/dashboard/apps/[id]",
  ],
  USER: ["/dashboard", "/dashboard/profile", "/dashboard/apps"],
};

export function doesRoleHaveAccessToURL(role: string, url: string) {
  const accessibleRoutes = roleAccessMap[role] || [];
  return accessibleRoutes.some((route) => {
    const regexPattern = route.replace(/\[.*?\]/g, "[^/]+").replace("/", "\\/");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
}
