import { createAccessControl } from "better-auth/plugins/access";
// import { defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  organization: ["org-update", "org-delete"],
  member: [
    "member-create",
    "member-update",
    "member-delete",
    "member-update-name",
  ],
  invitation: ["create-invitation", "cancel-invitation"],
} as const;
const dc = createAccessControl(statement);

const member = dc.newRole({
  member: ["member-update-name"],
});

const admin = dc.newRole({
  member: ["member-update", "member-delete", "member-update-name"],
  invitation: ["create-invitation", "cancel-invitation"],
});

const owner = dc.newRole({
  organization: ["org-update", "org-delete"],
  member: ["member-update", "member-delete", "member-update-name"],
  invitation: ["create-invitation", "cancel-invitation"],
});

export { statement, dc, owner, admin, member };
