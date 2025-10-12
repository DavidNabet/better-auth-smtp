"use client";

import { useActionState, useState, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Loader2, MessageCircle, Send } from "lucide-react";
import { getFeedbackByTitle } from "@/lib/feedback/feedback.utils";
import { addComment } from "@/lib/feedback/feedback.action";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";

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
  details: Awaited<ReturnType<typeof getFeedbackByTitle>>;
}

export default function CommentSection({
  comments,
  details,
}: CommentSectionProps) {
  return (
    <section className="space-y-6">
      <div className="border-accent border-t pt-12">
        <h2 className="text-foreground mb-8 flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          Comments ({details?.comments.length})
        </h2>
        {/* Comment Form */}
        <CommentForm feedbackId={details?.id!} />

        {/* Comment List */}
        <div className="space-y-6">
          {details?.comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border-accent hover:bg-accent rounded-xl border p-6 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={details?.author.image!}
                    alt={details?.author.name!}
                  />
                  <AvatarFallback>
                    {details?.author.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span>
                      <p className="text-foreground font-medium">
                        {details?.author.name}
                      </p>
                      <p className="text-accent-foreground text-sm">
                        {details?.createdAt.toLocaleDateString()}
                      </p>
                    </span>
                  </div>
                  <p className="text-accent-foreground leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4">
                    <Button
                      className="text-accent-foreground hover:text-primary gap-2"
                      size="sm"
                      variant="ghost"
                      // onClick={() => !comment.likes}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4"
                          // comment.likes ? "fill" : "stroke"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-accent-foreground hover:text-primary"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommentForm({ feedbackId }: { feedbackId: string }) {
  const [content, setContent] = useState("");
  const [
    {
      message: { success, error },
      errorMessage,
    },
    formAction,
    pending,
  ] = useActionState(addComment, {
    message: {
      success: "",
      error: "",
    },
    errorMessage: {},
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        if (!success && !error) return;
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        console.log(data);
        formAction(formData);
        setContent("");
        toast.success(success, {
          id: "feedbackComment",
        });
      } catch (err) {
        toast.error(error, {
          id: "feedbackComment",
        });
      }
    });
  }
  return (
    <form
      className="bg-card border-accent mb-12 rounded-xl border p-6"
      id="feedbackComment"
      onSubmit={handleSubmit}
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
        <ErrorMessages errors={errorMessage?.content} />
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
