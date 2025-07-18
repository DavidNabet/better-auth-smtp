import { Suspense } from "react";
import Link from "next/link";
import Icon from "@/lib/icon";
import { NavLink } from "./NavLink";
import { menu } from "@/components/routes";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import LoadingIcon from "./LoadingIcon";
import ModeToggle from "@/components/theme-toggle";

export default function Navbar() {
  return (
    <header className="border border-b border-primary/10">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
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
            <nav className="flex items-center space-x-4 lg:space-x-6">
              {menu.map((item, idx) => (
                <NavLink key={item.name} {...item}>
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="hidden md:flex items-center space-x-4 gap-3">
              <Suspense fallback={<LoadingIcon />}>
                <UserNav />
              </Suspense>
              <ModeToggle />
            </div>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Icon name="menu" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
