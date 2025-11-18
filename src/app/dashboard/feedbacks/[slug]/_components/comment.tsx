"use client";

import { ReactNode, useActionState, useId, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  Eye,
  Trash2,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import {
  addComment,
  deleteComment,
  toggleHideComment,
} from "@/lib/feedback/feedback.action";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import LikeButton from "./like";
import { Input } from "@/components/ui/input";
import { CommentWithRelations } from "@/lib/feedback/feedback.types";
import { useAuthState } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import BadgeUserComment from "@/app/_components/BadgeUserComment";

const useHideComment = () => {
  return useActionState(
    withCallbacks(
      toggleHideComment,
      createToastCallbacks({
        loading: "En cours...",
      })
    ),
    null
  );
};
const useDeleteComment = () => {
  return useActionState(
    withCallbacks(
      deleteComment,
      createToastCallbacks({
        loading: "En cours...",
      })
    ),
    null
  );
};

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
  disabled,
}: {
  feedbackId: string;
  parentId: string;
  disabled: boolean;
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
          variant="outline"
          size="sm"
          className={cn(
            "text-accent-foreground hover:text-primary",
            disabled && "bg-metal cursor-not-allowed"
          )}
          disabled={disabled}
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
  const { session } = useAuthState();
  const id = useId();

  const isModerator =
    session?.userRole === "ADMIN" || session?.userRole === "MODERATOR";

  const [, hideAction, hidePending] = useHideComment();
  const [, deleteAction, deletePending] = useDeleteComment();
  return (
    <li className="my-6">
      <div className="flex justify-between">
        <div className="bg-card border-primary/10 dark:border-accent hover:bg-accent rounded-xl border p-6 transition-colors flex-1">
          <div className="flex items-start space-x-4">
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={comment?.user?.image!}
                  alt={comment?.user?.name!}
                />
                <AvatarFallback className="text-white">
                  {comment?.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 gap-2">
                    {session?.userName === comment.user.name && (
                      <Badge variant="default" className="rounded-full">
                        You
                      </Badge>
                    )}
                    <BadgeUserComment
                      name={comment.user.name!}
                      role={comment?.user?.role}
                    />
                  </div>
                  <time
                    className="text-accent-foreground text-xs"
                    dateTime={comment?.createdAt.toLocaleDateString()}
                  >
                    {comment?.createdAt.toLocaleDateString()}
                  </time>
                </div>
                <p
                  className={cn(
                    "text-accent-foreground leading-relaxed",
                    comment.isHidden ? "text-sm italic text-gray-400" : ""
                  )}
                >
                  {comment.isHidden
                    ? "💬 Ce commentaire a été masqué par la modération."
                    : comment.content}
                </p>

                <div className="flex items-center gap-4">
                  <LikeButton
                    commentId={comment.id}
                    likes={comment.likes.length}
                    disabled={comment.isHidden}
                  />
                  <ReplyComment
                    feedbackId={comment.feedbackId}
                    parentId={comment.id}
                    disabled={comment.isHidden}
                  />
                </div>
              </div>
            </>
          </div>
        </div>
        {/* Boutons de modérations */}
        {isModerator && (
          <div className="flex flex-col ml-4 gap-4">
            <form action={hideAction} id={`hideAction-${id}`}>
              <input type="hidden" name="commentId" value={comment.id} />
              <Button
                type="submit"
                form={`hideAction-${id}`}
                variant={comment.isHidden ? "outline" : "secondary"}
                size="icon"
                className="rounded-sm border"
                disabled={hidePending}
                title={comment.isHidden ? "Restaurer" : "Masquer"}
              >
                {comment.isHidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </form>
            <Dialog>
              <form action={deleteAction} id={`deleteAction-${id}`}>
                <input type="hidden" name="commentId" value={comment.id} />

                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-sm border"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogHeader>
                      <DialogTitle>Supprimer ce commentaire</DialogTitle>
                      <DialogDescription>
                        Voulez-vous vraiment supprimer ce commentaire ?
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      form={`deleteAction-${id}`}
                      variant="destructive"
                      className="rounded-sm border"
                      disabled={deletePending}
                    >
                      Supprimer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </div>
        )}
      </div>
      {/* Réponses récursives */}
      {comment?.replies && comment.replies.length > 0 && (
        <AccordionComment
          com={`replies-${comment.id}`}
          answer={`Voir ${comment.replies.length} réponse${comment.replies.length > 1 ? "s" : ""}
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
        <AccordionTrigger className="text-xs text-gray-600 justify-start">
          {answer}
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
