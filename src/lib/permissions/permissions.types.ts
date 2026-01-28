import { statements } from "@/lib/user/user.service";
import { statement as orgStatements } from "@/lib/organization/organization.service";

export type Entities = keyof typeof statements;
export type OrgEntites = keyof typeof orgStatements;
export type PermissionFor<E extends Entities, O extends OrgEntites> =
  | (typeof statements)[E][number]
  | (typeof orgStatements)[O][number];
