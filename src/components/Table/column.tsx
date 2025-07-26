"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { User } from "@prisma/client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const usersHelper = createColumnHelper<User>();

// Checkbox Header

export const usersColumns = [
  usersHelper.accessor((row) => row.id, {
    id: "select",
    enableSorting: false,
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
  }),
  usersHelper.accessor((row) => row.name, {
    id: "name",
    header: "Name",
    cell: (info) => <span>{info.getValue()}</span>,
    enableSorting: true,
  }),
  usersHelper.accessor((row) => row.email, {
    id: "email",
    header: "Email",
    cell: (info) => <span>{info.getValue()}</span>,
    enableSorting: true,
  }),
  usersHelper.accessor((row) => row.role, {
    id: "role",
    header: "Role",
    enableSorting: false,
    cell: ({ row }) => {
      const isNotAdmin = row.original.role !== "ADMIN";

      if (!isNotAdmin) {
        return row.original.role;
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-role`} className="sr-only">
            Role
          </Label>
          <Select defaultValue={row.original.role}>
            <SelectTrigger
              className="**:data-[slot=select-value]:block **:data-[slot-select-value]:truncate"
              size="sm"
              id={`${row.original.id}-role`}
            >
              <SelectValue aria-label={row.original.role} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="MODERATE">MODERATE</SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  }),
  usersHelper.accessor((row) => row.twoFactorEnabled, {
    id: "twoFactorEnabled",
    header: "Two Factor",
    cell: (info) => (
      <span>{info.cell.row.original.twoFactorEnabled ? "Yes" : "No"}</span>
    ),
    enableSorting: true,
  }),
];
