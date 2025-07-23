import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  content: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statements);

export const user = ac.newRole({
  content: ["read", "update"],
});

export const moderate = ac.newRole({
  ...userAc.statements,
  content: ["create", "read", "update"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  content: ["create", "read", "update", "delete"],
});
