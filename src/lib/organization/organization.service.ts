import { createAccessControl } from "better-auth/plugins/access";
// import { defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete", "update-name"],
  invitation: ["create", "cancel"],
} as const;
const dc = createAccessControl(statement);

const member = dc.newRole({
  member: ["update-name"],
});

const admin = dc.newRole({
  member: ["update", "delete", "update-name"],
  invitation: ["create", "cancel"],
});

const owner = dc.newRole({
  organization: ["update", "delete"],
  member: ["update", "delete", "update-name"],
  invitation: ["create", "cancel"],
});

export { statement, dc, owner, admin, member };
