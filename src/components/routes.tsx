import Icon from "@/lib/icon";

export const menu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Icon name="layout-dashboard" className="mr-3" />,
  },
  {
    name: "Organizations",
    href: "/dashboard/organizations",
  },
  {
    name: "Apps",
    href: "/dashboard/apps",
  },
  {
    name: "Share your thought",
    href: "/dashboard/feedbacks",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Icon name="user-round-cog" className="mr-3" />,
    subMenu: [
      {
        name: "Account Settings",
        href: "/dashboard/settings",
      },
    ],
  },
];

export const adminRoute = [
  {
    name: "SUPER_ADMIN",
    href: "/dashboard/users/super_admin",
    icon: <Icon name="user-cog" className="mr-3" />,
    isAdmin: true,
  },
  {
    name: "MEMBER",
    href: "/dashboard/users/member",
    isAdmin: true,
  },
];
