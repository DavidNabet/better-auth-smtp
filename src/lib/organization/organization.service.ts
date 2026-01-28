import { createAccessControl } from "better-auth/plugins/access";

// Si une de ces actions est absente, les rôles qui ne la possèdent pas ne pourront pas exécuter les méthodes correspondantes (auth.organization.update, auth.organization.inviteMember, etc.) : elles seront considérées comme non autorisées.

const statement = {
  organization: ["org-update", "org-delete"],
  member: [
    "member-create",
    "member-update",
    "member-delete",
    "member-update-name",
  ],
  invitation: ["create", "cancel"],
} as const;
const dc = createAccessControl(statement);

const member = dc.newRole({
  member: ["member-update-name"],
});

const admin = dc.newRole({
  member: ["member-update", "member-delete", "member-update-name"],
  invitation: ["create", "cancel"],
});

const owner = dc.newRole({
  organization: ["org-update", "org-delete"],
  member: ["member-update", "member-delete", "member-update-name"],
  invitation: ["create", "cancel"],
});

export { statement, dc, owner, admin, member };
