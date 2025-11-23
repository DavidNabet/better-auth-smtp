import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  users: ["create", "list", "update", "delete"],
  comments: ["create", "toggle-hide", "delete"],
} as const;

const ac = createAccessControl(statements);

const USER = ac.newRole({
  users: ["update"],
  comments: ["create"],
});

const MODERATOR = ac.newRole({
  users: ["create", "list", "update"],
  comments: ["create", "toggle-hide", "delete"],
  user: ["ban"],
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
export { ac, statements, USER, MODERATOR, ADMIN, SUPER_ADMIN };
