import Icon from "@/lib/icon";

export const menu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Icon name="layout-dashboard" className="mr-3" />,
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
        name: "Profile",
        href: "/dashboard/settings/details",
      },
      {
        name: "Password & Security",
        href: "/dashboard/settings/security",
      },
    ],
  },
];

export const adminRoute = [
  {
    name: "ADMIN",
    href: "/dashboard/users/admin",
    icon: <Icon name="user-cog" className="mr-3" />,
    isAdmin: true,
  },
  {
    name: "MEMBER",
    href: "/dashboard/users/member",
    isAdmin: true,
  },
];
