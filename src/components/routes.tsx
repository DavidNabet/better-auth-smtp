import Icon from "@/lib/icon";

export const menu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Icon name="layout-dashboard" className="mr-3" />,
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
    isAdmin: true,
  },
  {
    name: "ADMIN",
    href: "/dashboard/users/admin",
    isAdmin: true,
  },
  {
    name: "MEMBER",
    href: "/dashboard/users/member",
    isAdmin: false,
  },
];
