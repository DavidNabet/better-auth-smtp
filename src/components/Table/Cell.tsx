import { CellContext, Row, Column, ColumnMeta } from "@tanstack/react-table";
import type { User } from "@prisma/client";

import { ChangeEvent, useEffect, useState, MouseEvent } from "react";
import { Input } from "../ui/input";
import { updateProfile, updateUser } from "@/lib/user/user.actions";
import { Check, EditIcon, X, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuthState } from "@/hooks/use-auth";

export type Option = {
  label: string;
  value: string;
};

export const TableCell = ({
  getValue,
  row,
  column,
  table,
}: CellContext<User, string>) => {
  const { session } = useAuthState();
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

  const onSelectChange = async (value: string) => {
    setValue(value);

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
        required
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
      <Select onValueChange={onChange} value={initialValue} required>
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

export const EditCell = ({ row, table }: CellContext<User, any>) => {
  const { session } = useAuthState();
  const meta = table.options.meta;
  const [isUpdating, setIsUpdating] = useState(false);

  const setEditedRows = async (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget.name;

    if (el === "done") {
      setIsUpdating(true);

      try {
        const currentRowData = table.getRow(row.id).original;

        if (!currentRowData?.id)
          console.log("No changes detected, skipping update");

        const updateData = {
          userId: currentRowData.id,
          role: currentRowData.role,
          name: currentRowData.name,
        };

        const setRoleResult = await updateUser(updateData);
        if (setRoleResult.success) {
          console.log("✅ setEditedRows success: ", setRoleResult.message);
        } else {
          console.error("❌ setEditedRows error: ", setRoleResult.message);
          // Revert changes on error
          meta?.revertData(row.index, true);
        }
      } catch (error) {
        console.error("Failed to update user: ", error);
        // Revert changes on error
        meta?.revertData(row.index, true);
      } finally {
        setIsUpdating(false);
      }
    }

    meta?.setEditedRows((prev: []) => ({
      ...prev,
      [row.id]: !prev[Number(row.id)],
    }));
    if (el !== "edit") {
      meta?.revertData(row.index, el === "cancel");
    }
  };

  /**
     * // Save changes to server when not reverting
          const currentRow = initialData[rowIndex] as any;
          const originalRow = originalData[rowIndex] as any;
          
          // Check if there are actual changes
          const hasChanges = JSON.stringify(currentRow) !== JSON.stringify(originalRow);
          
          if (hasChanges && currentRow?.id) {
            // Prepare update data
            const updateData: any = { userId: currentRow.id };
            
            // Only include changed fields
            if (currentRow.name !== originalRow.name) {
              updateData.name = currentRow.name;
            }
            if (currentRow.role !== originalRow.role) {
              updateData.role = currentRow.role;
            }
            if (currentRow.banned !== originalRow.banned) {
              updateData.banned = currentRow.banned;
            }
            if (currentRow.twoFactorEnabled !== originalRow.twoFactorEnabled) {
              updateData.twoFactorEnabled = currentRow.twoFactorEnabled;
            }
            
            // Call server action
            updateUser(updateData).then((result) => {
              if (result.success) {
                toast.success(result.message);
                // Update original data to reflect saved state
                setOriginalData((prev) =>
                  prev.map((row, idx) =>
                    idx === rowIndex ? initialData[rowIndex] : row
                  )
                );
              } else {
                toast.error(result.message);
                // Revert changes on error
                setInitialData((prev) =>
                  prev.map((row, idx) =>
                    idx === rowIndex ? originalData[rowIndex] : row
                  )
                );
              }
            }).catch((error) => {
              toast.error("Failed to update user");
              console.error("Update error:", error);
              // Revert changes on error
              setInitialData((prev) =>
                prev.map((row, idx) =>
                  idx === rowIndex ? originalData[rowIndex] : row
                )
              );
            });
          } else {
    */

  const removeRow = () => {
    meta?.removeRow(row.index);
  };

  return row.getIsSelected() ? (
    <Button
      onClick={removeRow}
      size="icon"
      className="rounded-full border hover:bg-destructive"
      variant="secondary"
      name="remove"
    >
      <X className="w-4 h-4 text-white" />
    </Button>
  ) : meta?.editedRows[row.id] ? (
    <div className="flex items-center gap-3">
      <Button
        onClick={setEditedRows}
        size="icon"
        className="rounded-full border hover:bg-slate-500"
        variant="secondary"
        name="cancel"
        disabled={isUpdating}
      >
        <Minus className="w-4 h-4 text-white" />
      </Button>
      <Button
        onClick={setEditedRows}
        className="rounded-full border hover:bg-emerald-500"
        size="icon"
        variant="secondary"
        name="done"
        disabled={isUpdating}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4 text-white" />
        )}
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Button
        onClick={setEditedRows}
        size="icon"
        variant="secondary"
        className="rounded-full border hover:bg-amber-700 in-disabled:cursor-not-allowed"
        name="edit"
        disabled={session?.userId === row.original.id}
      >
        <EditIcon className="w-4 h-4 text-white" />
      </Button>
    </div>
  );
};
