import { getCurrentUser } from "@/lib/user/user.utils";

export async function getActionsServer() {
  const { currentUser: session } = await getCurrentUser();

  return {
    canPerform: !!session,
    session,
  };
}
