import "server-only";

export const roleAccessMap: Record<string, string[]> = {
  admin: [
    "/",
    "/dashboard",
    "/profile",
    "/organizations",
    "/organizations/[id]",
    "/apps",
    "/apps/[id]",
    "/team",
    "/manage-users",
  ],
  owner: [
    "/",
    "/dashboard",
    "/profile",
    "/organizations",
    "/organizations/[id]",
    "/apps",
    "/apps/[id]",
    "/team",
  ],
  member: ["/", "/dashboard", "/profile", "/organization", "/app", "/team"],
  user: ["/", "/dashboard", "/profile", "/organization"],
};

export function doesRoleHaveAccessToURL(role: string, url: string) {
  const accessibleRoutes = roleAccessMap[role] || [];
  return accessibleRoutes.some((route) => {
    const regexPattern = route.replace(/\[.*?\]/g, "[^/]+").replace("/", "\\/");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
}
