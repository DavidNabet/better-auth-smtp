import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/organization/access";

// Si une de ces actions est absente, les rôles qui ne la possèdent pas ne pourront pas exécuter les méthodes correspondantes (auth.organization.update, auth.organization.inviteMember, etc.) : elles seront considérées comme non autorisées.

const statement = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete", "update-name"],
  invitation: ["create", "cancel"],
  team: defaultStatements.team,
} as const;
const dc = createAccessControl(statement);

const member = dc.newRole({
  member: ["update-name"],
});

const admin = dc.newRole({
  member: ["update", "delete", "update-name"],
  invitation: ["create", "cancel"],
  team: ["create", "update"],
});

const owner = dc.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete", "update-name"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
});

export { statement, dc, owner, admin, member };
