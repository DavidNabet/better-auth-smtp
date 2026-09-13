import { Suspense } from "react";
import Link from "next/link";
import Icon from "@/lib/icon";
import { NavLink } from "./NavLink";
import { adminRoute, menu } from "@/components/routes";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import LoadingIcon from "./LoadingIcon";
import ModeToggle from "@/components/theme-toggle";
import { getCurrentServerSession } from "@/lib/session/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  filterNavigationByRole,
  NAVIGATION_CONFIG,
} from "@/lib/rbac/navigation";
import { RoleType } from "@/lib/permissions/permissions.utils";
import Notification from "@/components/notifications/Notification";

export default async function Navbar() {
  const data = await getCurrentServerSession();
  const nav = filterNavigationByRole(
    NAVIGATION_CONFIG,
    data?.user.role as Uppercase<RoleType>,
  );
  console.log(nav);

  return (
    <header className="border border-b border-primary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link
              href="#"
              className="flex items-center text-2xl space-x-2 text-primary"
            >
              <span className="sr-only">Home</span>
              <Icon name="hexagon" size={22} />
              <span className="font-medium">PRELINE</span>
            </Link>
          </div>
          <div className="md:flex md:items-center md:gap-12">
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {nav.map((item) => (
                <NavLink key={item.label} {...item}>
                  {item.label}
                </NavLink>
              ))}
              {data?.user.role !== "USER" &&
                adminRoute
                  .filter((route) => route.name === data?.user.role)
                  .map((item) => (
                    <NavLink key={item.name} {...item}>
                      Me
                    </NavLink>
                  ))}
            </nav>
            <div className="hidden md:flex items-center space-x-4 gap-3">
              <Notification />
              <Suspense fallback={<LoadingIcon />}>
                <UserNav />
              </Suspense>
              <ModeToggle />
            </div>
            <MenuHamburger />
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuHamburger() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Icon name="menu" size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menu.map((item) => (
          <DropdownMenuItem key={item.name}>
            <NavLink {...item}>{item.name}</NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
