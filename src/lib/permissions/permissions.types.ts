import { statements } from "@/lib/user/user.service";
import { statement as orgStatements } from "@/lib/organization/organization.service";

export type Entities = keyof typeof statements;
export type OrgEntites = keyof typeof orgStatements;
export type PermissionFor<E extends Entities> = (typeof statements)[E][number];
export type PermissionOrgFor<E extends OrgEntites> =
  (typeof orgStatements)[E][number];
