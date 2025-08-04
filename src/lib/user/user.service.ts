import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  users: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statements);

export const USER = ac.newRole({
  users: ["read", "update"],
});

export const MODERATOR = ac.newRole({
  users: ["create", "read", "update"],
  ...adminAc.statements,
});

export const ADMIN = ac.newRole({
  ...adminAc.statements,
  users: ["create", "read", "update", "delete"],
});
