import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  comments: ["create-comment", "toggle-hide", "delete-comment"],
  topics: ["create-topic", "view-topic", "delete-topic"],
  apps: ["apps-create", "apps-list", "apps-update", "apps-delete"],
} as const;

const ac = createAccessControl(statements);

const USER = ac.newRole({
  user: ["update", "set-password"],
  comments: ["create-comment"],
  apps: ["apps-list"],
});

const MEMBER = ac.newRole({
  user: ["update", "set-password"],
  comments: ["create-comment", "toggle-hide"],
  apps: ["apps-list"],
});

const ADMIN = ac.newRole({
  comments: ["create-comment", "toggle-hide", "delete-comment"],
  apps: ["apps-list"],
  user: ["update", "set-password", "ban"],
});

const OWNER = ac.newRole({
  user: ["update", "set-password", "ban"],
  comments: ["create-comment", "toggle-hide", "delete-comment"],
  apps: ["apps-create", "apps-list", "apps-update", "apps-delete"],
});

const SUPER_ADMIN = ac.newRole({
  ...adminAc.statements,
  comments: ["create-comment", "toggle-hide", "delete-comment"],
  apps: ["apps-list", "apps-delete"],
});
export { ac, statements, USER, MEMBER, ADMIN, OWNER, SUPER_ADMIN };
