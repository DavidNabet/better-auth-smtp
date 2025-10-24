"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { getFeedbackWithComments } from "@/lib/feedback/feedback.utils";
import { addComment } from "@/lib/feedback/feedback.action";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import LikeButton from "./like";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: boolean;
}

interface CommentSectionProps {
  comments: Comment[];
  details: Awaited<ReturnType<typeof getFeedbackWithComments>>;
}

export default function CommentSection({
  comments,
  details,
}: CommentSectionProps) {
  if (!details) return null;
  const { topLevel, repliesByParent, feedback } = details;
  return (
    <section className="space-y-6">
      <div className="border-accent border-t pt-12">
        <h2 className="text-foreground mb-8 flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          Comments ({feedback?.comments.length})
        </h2>
        {/* Comment Form */}
        <CommentForm feedbackId={feedback?.id} />

        {/* Comment List */}
        <ul className="space-y-6">
          {topLevel.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} />

              {/* Answer */}
              {repliesByParent[comment.id]?.length ? (
                <ul className="ml-6 my-6">
                  {repliesByParent[comment.id].map((r) => (
                    <li key={r.id}>
                      <CommentItem comment={r} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CommentForm({ feedbackId }: { feedbackId: string }) {
  const [content, setContent] = useState("");

  const toastCallbacks = createToastCallbacks({
    loading: "Envoi du commentaire...",
  });

  const [state, formAction, pending] = useActionState(
    withCallbacks(addComment, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
        setContent("");
      },
    }),
    null
  );

  return (
    <form
      className="bg-card border-accent mb-12 rounded-xl border p-6"
      id="feedbackComment"
      action={formAction}
    >
      <input type="hidden" name="feedbackId" value={feedbackId} />
      <div className="space-y-4">
        <Textarea
          placeholder="Share your thoughts..."
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border-accent focus:border-primary min-h-[100px] resize-none"
        />
        <ErrorMessages errors={state?.errorMessage?.content ?? null} />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            className={cn(
              "gap-2 cursor-pointer",
              pending && "cursor-not-allowed bg-metal"
            )}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            Post Comment
          </Button>
        </div>
      </div>
    </form>
  );
}

function ReplyComment({
  feedbackId,
  parentId,
}: {
  feedbackId: string;
  parentId: string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [content, setContent] = useState("");

  const toastCallbacks = createToastCallbacks({
    loading: "Envoi du sous commentaire...",
  });

  const [state, formAction, pending] = useActionState(
    withCallbacks(addComment, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
        setContent("");
        setIsReplying(false);
      },
    }),
    null
  );
  return (
    <div>
      {!isReplying ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-accent-foreground hover:text-primary"
          onClick={() => setIsReplying(true)}
        >
          Reply
        </Button>
      ) : (
        <form action={formAction} id="replyComment" className="flex gap-2 mt-1">
          <input type="hidden" name="feedbackId" value={feedbackId} />
          <input type="hidden" name="parentId" value={parentId} />
          <div className="space-y-4">
            <Input
              type="text"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre réponse..."
              className="flex-1 border rounded px-2 py-1 text-sm"
              disabled={pending}
            />
            <ErrorMessages errors={state?.errorMessage?.content ?? null} />
          </div>

          <Button
            type="submit"
            variant="default"
            className={cn(
              "gap-2 cursor-pointer",
              pending && "cursor-not-allowed bg-metal"
            )}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            Envoyer
          </Button>
        </form>
      )}
    </div>
  );
}

function CommentItem({
  comment,
}: {
  comment: {
    user: {
      image: string | null;
      email: string;
      name: string | null;
      id: string;
    };
    likes: {
      createdAt: Date;
      id: string;
      userId: string;
      status: boolean;
      commentId: string;
    }[];
  } & {
    feedbackId: string;
    parentId: string | null;
    content: string;
    createdAt: Date;
    id: string;
    userId: string;
  };
}) {
  return (
    <div className="bg-card border-accent hover:bg-accent rounded-xl border p-6 transition-colors">
      <div className="flex items-start space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment?.user?.image!} alt={comment?.user?.name!} />
          <AvatarFallback>{comment?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-foreground font-medium">
              {comment?.user?.name ?? "User"}
            </p>
            <time className="text-accent-foreground text-xs">
              {comment?.createdAt.toLocaleDateString()}
            </time>
          </div>
          <p className="text-accent-foreground leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center gap-4">
            <LikeButton commentId={comment.id} likes={comment.likes.length} />
            <ReplyComment
              feedbackId={comment.feedbackId}
              parentId={comment.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
