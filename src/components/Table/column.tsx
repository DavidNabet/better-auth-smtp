"use client";

import { createColumnHelper, RowData } from "@tanstack/react-table";
import type { User } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Loader } from "lucide-react";
import { Option, EditCell, TableCell } from "@/components/Table/Cell";

const usersHelper = createColumnHelper<User>();

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    type: string;
    options?: Option[];
  }
}

// TODO: Generate Yopmail email api

export const usersColumns = [
  usersHelper.display({
    id: "select",
    enableSorting: false,
    header: ({ table }) => {
      return (
        table.options.meta?.id === "adminColumns" && (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        )
      );
    },
    cell: ({ table, row }) => {
      return (
        table.options.meta?.id === "adminColumns" && (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        )
      );
    },
  }),
  usersHelper.accessor((row) => row.image, {
    id: "avatar",
    header: "Avatar",
    cell: ({ row }) => (
      <Avatar className="size-8">
        {row.original.image ? (
          <AvatarImage src={row.original.image} className="object-cover" />
        ) : (
          <AvatarFallback className="dark:bg-neutral-100 bg-neutral-700 text-accent text-xs">
            {row.original.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
    ),
  }),
  usersHelper.accessor((row) => row.name, {
    id: "name",
    header: "Name",
    // cell: (info) => <span>{info.getValue()}</span>,
    cell: TableCell,
    enableSorting: true,
    meta: {
      type: "text",
    },
  }),
  usersHelper.accessor((row) => row.email, {
    id: "email",
    header: "Email",
    cell: (info) => <span>{info.getValue()}</span>,
    enableSorting: true,
  }),
  usersHelper.accessor((row) => row.emailVerified, {
    id: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.emailVerified ? (
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-700" />
            Done
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Loader className="w-4 h-4" />
            In Process
          </span>
        )}
      </Badge>
    ),
    enableSorting: false,
  }),
  usersHelper.accessor((row) => row.role, {
    id: "role",
    header: "Role",
    enableSorting: false,
    meta: {
      type: "select",
      options: [
        { value: "ADMIN", label: "ADMIN" },
        { value: "MEMBER", label: "MEMBER" },
        { value: "USER", label: "USER" },
      ],
    },
    cell: TableCell,
  }),
  usersHelper.accessor((row) => row.twoFactorEnabled, {
    id: "twoFactorEnabled",
    header: "Two Factor",
    cell: (info) => (
      <span>{info.cell.row.original.twoFactorEnabled ? "Yes" : "No"}</span>
    ),
    enableSorting: true,
  }),
  usersHelper.accessor((row) => row.banned, {
    id: "banned",
    header: "Ban",
    cell: ({ row }) => <span>{row.original.banned ? "Yes" : "No"}</span>,
    enableSorting: true,
  }),
  usersHelper.display({
    header: "Actions",
    id: "actions",
    cell: EditCell,
    // cell: () => (
    //   <DropdownMenu>
    //     <DropdownMenuTrigger asChild>
    //       <Button variant="ghost" size="icon">
    //         <EllipsisVertical className="w-4 h-4" />
    //       </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent align="end" className="w-32">
    //       <DropdownMenuItem>Edit</DropdownMenuItem>
    //       <DropdownMenuSeparator />
    //       <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
    //     </DropdownMenuContent>
    //   </DropdownMenu>
    // ),
  }),
];
