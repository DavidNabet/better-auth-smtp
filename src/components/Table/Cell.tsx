import {
  CellContext,
  Row,
  Column,
  ColumnMeta,
  TableMeta,
} from "@tanstack/react-table";
import {
  ChangeEvent,
  useEffect,
  useState,
  MouseEvent,
  SyntheticEvent,
  FormEvent,
  useRef,
  DialogHTMLAttributes,
} from "react";
import type { Role, User } from "@prisma/client";
import { deleteUser, updateProfile, updateUser } from "@/lib/user/user.actions";
import { useAuthState } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/auth.client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, EditIcon, X, Minus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DialogCloseProps, DialogTriggerProps } from "@radix-ui/react-dialog";
import { RoleType } from "@/lib/permissions/permissions.utils";

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

/**
 * SelectCell rend un Select pour éditer le rôle d’un utilisateur.
 * Règles:
 * - L’option ADMIN est visible uniquement si le rôle courant est SUPER_ADMIN.
 * - Toutes les autres options restent visibles pour tous les rôles.
 */
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
  const { session } = useAuthState();
  // ADMIN visible uniquement si le rôle courant est SUPER_ADMIN
  const isNotAdmin = row.original.role !== "SUPER_ADMIN";
  const isSuperAdmin = session?.role === "SUPER_ADMIN";
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
          {columnMeta?.options
            // Affiche toutes les options; ADMIN seulement si le rôle courant est SUPER_ADMIN
            ?.filter((option: Option) =>
              option.label === "ADMIN" ? isSuperAdmin : true,
            )
            .map((option: Option) => (
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
  // const { data: session } = authClient.useSession();
  const { session } = useAuthState();
  const meta = table.options.meta;
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dialogRef = useRef<HTMLButtonElement>(null);

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
          role: currentRowData.role as Exclude<Role, "OWNER">,
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

  /* // Save changes to server when not reverting
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

  const removeRow = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("userId", row.original.id);

      // Call the deleteUser server action
      const result = await deleteUser(
        {
          message: { success: "", error: "" },
        },
        formData,
      );
      if (result.message.success) {
        console.log("✅ remove row success: ", result.message.success);
        meta?.removeRow(row.index);
        // hide dialog after removal
        dialogRef.current?.click();
      } else if (result.message.error) {
        console.error("❌ remowe row error: ", result.message.error);
        // Revert changes on error
      }
    } catch (error) {
      console.log("❌ Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return row.getIsSelected() ? (
    <Dialog>
      <form id="rowUser" onSubmit={removeRow}>
        <DialogTrigger asChild ref={dialogRef}>
          <Button
            size="icon"
            className="rounded-full bg-metal dark:bg-accent hover:bg-destructive dark:hover:bg-destructive"
            variant="secondary"
          >
            <X className="w-4 h-4 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action is
              irreversible. Please confirm if you wish to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="submit"
              name="remove"
              variant="destructive"
              form="rowUser"
              className={cn(
                "shrink-0 transition-colors focus:ring-offset-2 focus:ring-offset-secondary cursor-pointer w-full text-white bg-destructive/90 hover:bg-destructive",
              )}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete this user !
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  ) : meta?.editedRows[row.id] ? (
    <div className="flex items-center gap-3">
      <Button
        onClick={setEditedRows}
        size="icon"
        className="rounded-full bg-metal dark:bg-accent hover:bg-slate-500 dark:hover:bg-slate-500"
        variant="secondary"
        name="cancel"
        disabled={isUpdating}
      >
        <Minus className="w-4 h-4 text-white" />
      </Button>
      <Button
        onClick={setEditedRows}
        className="rounded-full bg-metal dark:bg-accent hover:bg-emerald-500 dark:hover:bg-emerald-500"
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
        className="rounded-full dark:bg-accent bg-metal hover:bg-amber-700 dark:hover:bg-amber-700"
        name="edit"
        disabled={session?.userId === row.original.id}
      >
        <EditIcon className="w-4 h-4 text-white" />
      </Button>
    </div>
  );
};
