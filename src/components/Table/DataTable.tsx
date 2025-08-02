"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { ChevronDown, ChevronUp, ColumnsIcon } from "lucide-react";

import type {
  SortingState,
  ColumnDef,
  VisibilityState,
  Row,
  ColumnFiltersState,
  RowData,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useState, useEffect, SetStateAction, Dispatch } from "react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    revertData: (rowIndex: number, revert: boolean) => void;
    editedRows: any;
    setEditedRows: Dispatch<SetStateAction<{}>>;
    removeRow: (rowIndex: number) => void;
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  id?: string;
}

export function DataTable<TData>({ columns, data, id }: DataTableProps<TData>) {
  const [initialData, setInitialData] = useState(() => [...data]);
  const [originalData, setOriginalData] = useState(() => [...data]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editedRows, setEditedRows] = useState({});

  const table = useReactTable({
    data: initialData,
    columns,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility,
      columnFilters,
      sorting,
      rowSelection,
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setInitialData((prev) =>
          prev.map((row, idx) => {
            if (idx === rowIndex) {
              return {
                ...prev[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      editedRows,
      setEditedRows,
      revertData(rowIndex, revert) {
        if (revert) {
          setInitialData((prev) =>
            prev.map((row, idx) =>
              idx === rowIndex ? originalData[rowIndex] : row
            )
          );
        } else {
          setOriginalData((prev) =>
            prev.map((row, idx) =>
              idx === rowIndex ? initialData[rowIndex] : row
            )
          );
        }
      },
      removeRow(rowIndex) {
        const setFilter = (prev: TData[]) =>
          prev.filter((_: TData, idx: number) => idx !== rowIndex);
        setInitialData(setFilter);
        setOriginalData(setFilter);
      },
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div>
      <div className="flex justify-end items-center my-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ColumnsIcon />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md relative border">
        <Table>
          <TableCaption className="p-2.5">
            Nombre de users: {initialData.length}
          </TableCaption>
          <TableHeader className="dark:bg-muted bg-accent sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const direction = header.column.getIsSorted();
                  const arrow = {
                    asc: <ChevronUp className="w-4 h-4" />,
                    desc: <ChevronDown className="w-4 h-4" />,
                  };
                  const sort_indicator = direction && arrow[direction];
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          onChange={header.column.getToggleVisibilityHandler()}
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex cursor-pointer gap-2 items-center"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {direction && <span>{sort_indicator}</span>}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-ceil]:first:w-8">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="relative z-0 data-[state=selected]:bg-accent hover:bg-accent/50 dark:data-[state=selected]:bg-muted dark:hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
