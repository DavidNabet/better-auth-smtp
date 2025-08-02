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

export const user = ac.newRole({
  users: ["read", "update"],
});

export const moderate = ac.newRole({
  ...userAc.statements,
  users: ["create", "read", "update"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  users: ["create", "read", "update", "delete"],
});
