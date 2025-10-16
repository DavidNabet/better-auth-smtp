"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, MessageCircleMore } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteProvider, useVotes } from "@/hooks/use-vote";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import NotificationBadge from "@/app/_components/NotificationBadge";
import { allFeedbackProps } from "@/lib/feedback/feedback.utils";

export type Feedback = {
  id: string;
  title: string;
  date?: string | Date;
  subject: string | null;
  description: string;
  team?: {
    id: number;
    avatar: string;
  }[];
};

type InitialVotes = {
  feedbackId: string;
  upvote: number;
  downvote: number;
}[];

export function FeedbackList({
  feedbacks = [],
  initialVotes = [],
}: {
  feedbacks: allFeedbackProps;
  initialVotes: InitialVotes;
}) {
  if (feedbacks?.length === 0) {
    return (
      <div className="text-sm text-muted-foreground px-3 py-4 border rounded-lg">
        <p>No ideas to display.</p>
      </div>
    );
  }
  return (
    <section className="grid md:grid-cols-3 w-max-lg gap-6 p-4">
      <>
        {feedbacks?.map((f) => (
          <Card key={f.id} className="border rounded-md py-0">
            <div className="flex gap-2 h-full">
              <div className="h-full py-4 bg-accent/30">
                <VoteProvider initialVotes={initialVotes}>
                  <UpvoteComponent feedbackId={f.id} />
                </VoteProvider>
              </div>
              <div className="flex-1 w-full py-4">
                <Link href={`/dashboard/feedbacks/${slugify(f.title)}`}>
                  <CardHeader className="pl-0 relative">
                    <CardTitle>{f.subject}</CardTitle>
                    <span className="mt-1 text-xs text-card-foreground">
                      {f.title}
                    </span>
                    <CardDescription>{f.description}</CardDescription>
                    <div className="absolute end-3.5 top-0">
                      <NotificationBadge num={f.comments.length}>
                        <MessageCircleMore className="size-5 text-accent-foreground/20" />
                      </NotificationBadge>
                    </div>
                  </CardHeader>

                  {/* f.comments && (
                    <CardFooter className="px-2 pt-3 flex items-center justify-between">
                      <div className="*:data-[slot=avatar]:ring-accent flex -space-x-2 *:data-[slot=avatar]:ring-2">
                        {f?.comments.map((t) => (
                          <Avatar key={t?.user?.id}>
                            <AvatarImage
                              src={t?.user?.image!}
                              alt={t?.user?.image?.slice(2, 4).toUpperCase()}
                            />
                            <AvatarFallback>
                              {t?.user?.image?.slice(2, 4).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </CardFooter>
                  )*/}
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </>
    </section>
  );
}

function UpvoteComponent({ feedbackId }: { feedbackId: string }) {
  const { votes, handleVote, isPending } = useVotes();
  const feedbackVotes = votes[feedbackId];

  if (!feedbackVotes) return null;
  return (
    <div className="flex flex-col items-stretch px-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote(feedbackId, "UP")}
        disabled={isPending}
        className={`${
          feedbackVotes.userVote === "UP"
            ? "bg-green-500/20 text-green-500/90"
            : "hover:bg-green-200!"
        }`}
        title={
          feedbackVotes.userVote === "UP"
            ? "Cliquez pour annuler votre vote positif"
            : "Voter positivement"
        }
      >
        <ChevronUp />
      </Button>
      <span
        className={`text-3xl text-primary font-light border-primary text-center`}
      >
        {feedbackVotes.upvote || feedbackVotes.downvote}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote(feedbackId, "DOWN")}
        disabled={isPending}
        className={`${
          feedbackVotes.userVote === "DOWN"
            ? "bg-destructive/20 text-destructive/90"
            : "hover:bg-red-400!"
        }`}
        title={
          feedbackVotes.userVote === "DOWN"
            ? "Cliquez pour annuler votre vote négatif"
            : "Voter négativement"
        }
      >
        <ChevronDown />
      </Button>
    </div>
  );
}
