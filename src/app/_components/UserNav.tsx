import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "@/app/_components/LogOut";
import Link from "next/link";
import { menu } from "@/components/routes";
import { getCurrentServerSession } from "@/lib/session/server";

export async function UserNav() {
  const { userEmail, userName, userImage } = await getCurrentServerSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative size-9.5 rounded-full focus:ring-offset-neutral-300 focus:ring-offset-2 "
        >
          <Avatar className="size-9.5">
            {userImage ? (
              <AvatarImage src={userImage} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-neutral-800 text-primary-forground text-md">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {menu[1].subMenu?.map((item, idx) => (
            <DropdownMenuItem key={item.name}>
              <Link href={item.href}>{item.name}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogOut className="flex w-full items-center gap-2 rounded-sm hover:bg-red-700/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4 text-red-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </LogOut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
