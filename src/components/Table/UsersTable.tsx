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
import { Badge } from "../ui/badge";

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

export async function LogTable() {
  const logs = await db.moderationLog.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      moderator: true,
    },
  });
  return (
    <Table>
      <TableCaption>Nombre de logs: {logs.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Action</TableHead>
          <TableHead>Créé</TableHead>
          <TableHead>Mise à jour</TableHead>
          <TableHead className="font-semibold text-right">Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs?.length > 0 ? (
          logs.map((log) => {
            return (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(log.createdAt)}
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(log.updatedAt)}
                </TableCell>
                <TableCell className="font-semibold text-right">
                  {log.moderator.name}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell>No logs</TableCell>
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
