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
    id: "organizations",
    label: "Organizations",
    href: "/dashboard/orgs",
    permission: "ban",
    children: [
      {
        id: "organization",
        label: "Organization",
        href: "/dashboard/orgs/[slug]",
        permission: "update-name",
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
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
  },
];

// La vérification d'autorisation côté client est une défense en profondeur.
// La vérification réelle est effectuée côté serveur via auth.api.hasPermission().
export function filterNavigationByRole(
  navigation: NavigationItem[],
  _userRole: Uppercase<RoleType>,
): NavigationItem[] {
  return navigation.filter((item) => {
    // Filtrer les enfants récursivement
    if (item.children) {
      const filteredChildren = filterNavigationByRole(
        item.children,
        _userRole,
      );

      // Masquer le parent s'il n'a pas d'enfants accessibles
      if (filteredChildren.length === 0) {
        return false;
      }

      return { ...item, children: filteredChildren };
    }

    return true;
  });
}
