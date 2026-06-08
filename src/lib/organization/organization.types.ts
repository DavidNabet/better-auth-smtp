type ActivityTypeEvent =
  | "member_joined"
  | "member_left"
  | "member_role_changed"
  | "app_created"
  | "app_updated"
  | "settings_updated";

type ActivityEvent = {
  id: string;
  type: ActivityTypeEvent;
  actor: {
    id: string;
    name: string;
  };
  organizationId: string;
  teamId?: string;
  appId?: string;

  metadata: Record<string, unknown>;

  createdAt: Date;
};
