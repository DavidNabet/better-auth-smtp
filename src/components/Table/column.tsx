"use client";

import {
  createColumnHelper,
  TableMeta,
  ColumnDef,
  Column,
  Row,
  CellContext,
  RowData,
  ColumnMeta,
} from "@tanstack/react-table";
import type { User } from "@prisma/client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Loader,
  EllipsisVertical,
  Check,
  EditIcon,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useState, MouseEvent } from "react";
import { Input } from "../ui/input";

const usersHelper = createColumnHelper<User>();

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    type: string;
    options?: Option[];
  }
}

type Option = {
  label: string;
  value: string;
};

const TableCell = ({
  getValue,
  row,
  column,
  table,
}: CellContext<User, string>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const tableMeta = table.options.meta;
  const columnMeta = column.columnDef.meta;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    tableMeta?.updateData(row.index, column.id, value);
  };

  const onSelectChange = (value: string) => {
    setValue(value);
    // impersionate authContext.infer.updateUser
    tableMeta?.updateData(row.index, column.id, value);
  };

  if (tableMeta?.editedRows[row.id]) {
    return columnMeta?.type === "select" ? (
      <SelectCell
        columnMeta={columnMeta}
        initialValue={initialValue}
        row={row}
        onChange={onSelectChange}
      />
    ) : (
      <Input
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        className="w-2/3"
        type={columnMeta?.type || "text"}
      />
    );
  }
  return value;
};

const SelectCell = ({
  row,
  initialValue,
  columnMeta,
  onChange,
}: {
  row: Row<User>;
  initialValue: string;
  columnMeta: ColumnMeta<User, string>;
  onChange: (v: string) => void;
}) => {
  const isNotAdmin = row.original.role !== "ADMIN";

  if (!isNotAdmin) {
    return row.original.role;
  }
  return (
    <>
      <Label htmlFor={`${row.original.id}-role`} className="sr-only">
        Role
      </Label>
      <Select onValueChange={onChange} value={initialValue}>
        <SelectTrigger
          className="**:data-[slot=select-value]:block **:data-[slot-select-value]:truncate"
          size="sm"
          id={`${row.original.id}-role`}
        >
          <SelectValue aria-label={row.original.role} />
        </SelectTrigger>
        <SelectContent align="end">
          {columnMeta?.options?.map((option: Option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

const EditCell = ({ row, table }: CellContext<User, any>) => {
  const meta = table.options.meta;

  const setEditedRows = (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget.name;
    meta?.setEditedRows((prev: []) => ({
      ...prev,
      [row.id]: !prev[Number(row.id)],
    }));
    if (el !== "edit") {
      meta?.revertData(row.index, e.currentTarget.name === "cancel");
    }
  };
  return meta?.editedRows[row.id] ? (
    <>
      <Button
        onClick={setEditedRows}
        size="icon"
        className="rounded-full"
        variant="ghost"
        name="cancel"
      >
        <X className="w-4 h-4 text-white" />
      </Button>
      <Button
        onClick={setEditedRows}
        className="rounded-full"
        size="icon"
        variant="ghost"
        name="done"
      >
        <Check className="w-4 h-4 text-white" />
      </Button>
    </>
  ) : (
    <Button
      onClick={setEditedRows}
      size="icon"
      variant="ghost"
      className="rounded-full"
      name="edit"
    >
      <EditIcon className="w-4 h-4 text-white" />
    </Button>
  );
};

// TODO: Generate Yopmail email api

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
        { value: "MODERATE", label: "MODERATE" },
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
