"use client";

import { useActionState } from "react";
import { createUsers } from "@/lib/user/user.actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  withCallbacks,
  createToastCallbacks,
} from "@/app/_components/ServerActionToast";

export const GenerateUsers = ({ userId }: { userId: string }) => {
  const toastCallbacks = createToastCallbacks({
    loading: "En cours...",
  });

  const [formState, formAction, pending] = useActionState(
    withCallbacks(createUsers, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
      },
    }),
    null
  );
  // const { pending } = useFormStatus();

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button variant="default" type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Users
      </Button>
    </form>
  );
};
