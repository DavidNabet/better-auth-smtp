import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  users: ["create", "list", "update", "delete"],
  comments: ["create", "toggle-hide", "delete"],
} as const;

const ac = createAccessControl(statements);

const USER = ac.newRole({
  user: ["update", "set-password"],
  comments: ["create"],
})

const MEMBER = ac.newRole({
  users: ["create", "list", "update"],
  comments: ["create", "toggle-hide"],
});

const ADMIN = ac.newRole({
  users: ["create", "list", "update", "delete"],
  comments: ["create", "toggle-hide", "delete"],
  user: ["ban"],
});

const SUPER_ADMIN = ac.newRole({
  ...adminAc.statements,
  users: ["create", "list", "update", "delete"],
  comments: ["create", "toggle-hide", "delete"],
});
export { ac, statements, USER, MEMBER, ADMIN, SUPER_ADMIN };
