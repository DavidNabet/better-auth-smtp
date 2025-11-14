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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GetModerationActions,
  getModerationActionsTree,
} from "@/lib/permissions/permissions.utils";
import AccordionRow from "./LogRow";

export async function UsersTable() {
  const users = await db.user.findMany({
    take: 5,
  });
  return (
    <Table>
      <TableCaption>Nombre de users: {users.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Two Factor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.name}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className="text-right">
                {user.twoFactorEnabled ? "Yes" : "No"}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell>No users</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export async function LogDisplay() {
  const logs = await db.moderationLog.groupBy({
    by: ["action"],
    _count: {
      action: true,
    },
  });
  return (
    <ul className="divide-y">
      {logs.length > 0 ? (
        logs.map((log, i) => {
          return (
            <li
              className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 justify-between"
              key={i}
            >
              <h3>{log.action}</h3>

              <div className="grid gap-1.5 font-normal">
                <Badge>{log._count.action}</Badge>
              </div>
            </li>
          );
        })
      ) : (
        <li>No logs</li>
      )}
    </ul>
  );
}

export async function LogTable() {
  const logs = await getModerationActionsTree();
  return (
    <div className="max-w-fit overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="grid grid-cols-[40px_100px_180px_120px_100px_110px] border-b-0 bg-muted/50">
              <TableHead className="p-3" />
              <TableHead className="p-3 font-semibold text-foreground text-sm">
                ID
              </TableHead>
              <TableHead className="p-3 font-semibold text-foreground text-sm">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => {
              return (
                <AccordionRow
                  defaultOpen={index === 0}
                  key={log.id}
                  row={log}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
