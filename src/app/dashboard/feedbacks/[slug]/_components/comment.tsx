"use client";

import { ReactNode, useActionState, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { addComment } from "@/lib/feedback/feedback.action";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import LikeButton from "./like";
import { Input } from "@/components/ui/input";
import { CommentWithRelations } from "@/lib/feedback/feedback.types";

export function CommentForm({ feedbackId }: { feedbackId: string }) {
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

export function CommentItem({
  comment,
  feedbackId,
}: {
  comment: CommentWithRelations;
  feedbackId: string;
}) {
  return (
    <li className="my-6">
      <div className="bg-card border-accent hover:bg-accent rounded-xl border p-6 transition-colors">
        <div className="flex items-start space-x-4">
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={comment?.user?.image!}
                alt={comment?.user?.name!}
              />
              <AvatarFallback>{comment?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-foreground font-medium">
                  {comment?.user?.name ?? "User"}
                </p>
                <time
                  className="text-accent-foreground text-xs"
                  dateTime={comment?.createdAt.toLocaleDateString()}
                >
                  {comment?.createdAt.toLocaleDateString()}
                </time>
              </div>
              <p className="text-accent-foreground leading-relaxed">
                {comment.content}
              </p>

              <div className="flex items-center gap-4">
                <LikeButton
                  commentId={comment.id}
                  likes={comment.likes.length}
                />
                <ReplyComment
                  feedbackId={comment.feedbackId}
                  parentId={comment.id}
                />
              </div>
            </div>
          </>
        </div>
      </div>
      {/* Réponses récursives */}
      {comment?.replies && comment.replies.length > 0 && (
        <AccordionComment
          com={`replies-${comment.id}`}
          answer={`
          Voir ${comment.replies.length} réponse
          ${comment.replies.length > 1 ? "s" : ""}
        `}
        >
          <ul className="ml-6 my-6">
            {comment.replies.map((reply) => (
              <CommentItem
                comment={reply}
                key={reply.id}
                feedbackId={feedbackId}
              />
            ))}
          </ul>
        </AccordionComment>
      )}
    </li>
  );
}

function AccordionComment({
  com,
  answer,
  children,
}: {
  com: string;
  answer: string;
  children: ReactNode;
}) {
  return (
    <Accordion type="single" collapsible className="ml-2">
      <AccordionItem value={com}>
        <AccordionTrigger className="text-xs text-gray-600">
          {answer}
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
