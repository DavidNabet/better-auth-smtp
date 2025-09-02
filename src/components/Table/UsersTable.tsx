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
