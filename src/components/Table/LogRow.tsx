"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GetModerationActions } from "@/lib/permissions/permissions.utils";

interface AccordionRowProps {
  row: GetModerationActions[number];
  defaultOpen?: boolean;
}
const AccordionRow = ({ row, defaultOpen = false }: AccordionRowProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasChildren = row.children && row.children.length > 0;
  return (
    <>
      <TableRow
        className={cn(
          "grid grid-cols-[40px_100px_150px_120px_130px_110px]",
          isOpen && "border-b-0 bg-muted/40"
        )}
      >
        <TableCell className="p-0">
          <Button
            aria-label={isOpen ? "Collapse row" : "Expand row"}
            className={cn(
              "h-full w-full rounded-none p-3 text-muted-foreground transition-colors",
              hasChildren && "hover:bg-transparent hover:text-foreground",
              !hasChildren && "cursor-default opacity-30"
            )}
            disabled={!hasChildren}
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            variant="ghost"
          >
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="p-3 font-medium font-mono text-muted-foreground text-sm">
          {row.id}
        </TableCell>
        <TableCell className="p-3 font-medium text-sm">{row.action}</TableCell>
      </TableRow>

      {hasChildren && (
        <TableRow className="grid grid-cols-[40px_100px_150px_120px_130px_110px] border-b-0 hover:bg-transparent">
          <TableCell className="col-span-6 p-0" colSpan={6}>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="w-full border-border border-b bg-muted/20">
                <Table>
                  <TableHeader>
                    <TableRow className="grid grid-cols-[30px_80px_100px_140px_150px_150px] border-b-0 bg-muted/30">
                      <TableHead className="flex h-7 items-center border-border border-y px-3 py-1.5" />
                      <TableHead className="flex h-7 items-center border-border border-y px-3 py-1.5 text-xs">
                        Role
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border border-y px-3 py-1.5 text-xs">
                        Name
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border border-y px-3 py-1.5 text-xs">
                        Action
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border border-y px-3 py-1.5 text-xs">
                        Crée
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border border-y px-3 py-1.5 text-xs">
                        Mise à jour
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {row.children?.map((childRow) => (
                      <TableRow
                        key={childRow?.id}
                        className="grid grid-cols-[30px_80px_100px_140px_150px_150px]"
                      >
                        <TableCell className="px-3 py-2" />
                        <TableCell className="px-3 py-2 font-mono text-muted-foreground text-xs">
                          {childRow.moderator.role.slice(0, 1).toUpperCase()}
                        </TableCell>
                        <TableCell className="px-3 py-2 font-mono text-muted-foreground text-xs">
                          {childRow.moderator.name}
                        </TableCell>
                        <TableCell className="px-3 py-2 font-medium text-xs">
                          {childRow.action}
                        </TableCell>
                        <TableCell className="px-3 py-2 font-medium text-xs">
                          {new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(childRow.createdAt)}
                        </TableCell>
                        <TableCell className="px-3 py-2 font-medium text-xs">
                          {new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(childRow.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default AccordionRow;
