"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createUsers } from "@/lib/user/user.actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Alert from "@/app/_components/Alert";

export const GenerateUsers = ({ userId }: { userId: string }) => {
  const [formState, formAction, pending] = useActionState(createUsers, {
    message: {
      success: "",
      error: "",
    },
  });

  const { error, success } = formState.message;

  // const { pending } = useFormStatus();

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button variant="default" type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Users
      </Button>
      <div className="col-span-6">
        {error && <Alert message={error!} status="error" />}
        {success && <Alert message={success!} status="success" />}
      </div>
    </form>
  );
};
