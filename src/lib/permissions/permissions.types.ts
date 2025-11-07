import { statements } from "@/lib/user/user.service";

export type Entities = keyof typeof statements;
export type PermissionFor<E extends Entities> = (typeof statements)[E][number];
