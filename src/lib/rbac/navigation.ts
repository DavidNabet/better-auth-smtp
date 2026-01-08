import { hasActionPermission } from "./action-permissions";
import {
  SUPER_ADMIN,
  ADMIN,
  MEMBER,
  USER,
  statements,
  ac,
} from "../user/user.service";
import { RoleType } from "../permissions/permissions.utils";
import { AnyStatement } from "./permissions";

const comments = [...statements.comments];
const user = [...statements.user];
const session = [...statements.session];

const al = [...comments, ...user, ...session];

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  permission?: AnyStatement;
  children?: NavigationItem[];
  badge?: string;
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
  },
  {
    id: "organizations",
    label: "Organizations",
    href: "/dashboard/organizations",
    permission: "org-update",
    children: [
      {
        id: "organization",
        label: "Organization",
        href: "/dashboard/organizations/[id]",
        permission: "org-delete",
      },
    ],
  },
  {
    id: "apps",
    label: "Apps",
    href: "/dashboard/apps",
    permission: "apps-list",
    children: [
      {
        id: "app",
        label: "App Detail",
        href: "/dashboard/apps/[slug]",
        permission: "apps-list",
      },
    ],
  },
  {
    id: "feedbacks",
    label: "Feedbacks",
    href: "/dashboard/feedbacks",
    permission: "view-topic",
    children: [
      {
        id: "Feedback",
        label: "Feedback",
        href: "/dashboard/feedbacks/[id]",
        permission: "create-comment",
      },
    ],
  },
  {
    id: "users",
    label: "User Management",
    href: "/dashboard/manage-users",
    permission: "list",
    badge: "Admin",
  },
];

export function filterNavigationByRole(
  navigation: NavigationItem[],
  userRole: RoleType
): NavigationItem[] {
  return navigation
    .map((item) => {
      // Check if user has permission for this item
      if (item.permission && !hasActionPermission(userRole, item.permission)) {
        return null;
      }

      // Filter children recursively
      if (item.children) {
        const filteredChildren = filterNavigationByRole(
          item.children,
          userRole
        );

        // Hide parent if no children are accessible
        if (filteredChildren.length === 0) {
          return null;
        }

        return { ...item, children: filteredChildren };
      }

      return item;
    })
    .filter((item): item is NavigationItem => item !== null);
}
