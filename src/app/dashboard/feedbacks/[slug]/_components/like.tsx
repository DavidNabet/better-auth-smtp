"use client";

import { useActionState } from "react";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import { toggleLike } from "@/lib/feedback/feedback.action";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type LikeButtonProps = {
  commentId: string;
};

const useToggleLike = () => {
  return useActionState(
    withCallbacks(
      toggleLike,
      createToastCallbacks({
        loading: "Loading...",
      })
    ),
    null
  );
};

export default function LikeButton({ commentId }: LikeButtonProps) {
  const [, formAction, pending] = useToggleLike();

  return (
    <form action={formAction}>
      <input type="hidden" name="commentId" value={commentId} />
      <Button
        className="text-accent-foreground hover:text-primary gap-2"
        size="sm"
        variant="ghost"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <Heart className="h-4 w-4 fill-metal" />
        ) : (
          <Heart className="h-4 w-4 stroke-0 fill-rose-600" />
        )}
      </Button>
    </form>
  );
}
