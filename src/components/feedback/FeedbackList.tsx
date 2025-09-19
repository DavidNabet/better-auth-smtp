"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { CardInner } from "@/app/_components/Card";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UpvoteProvider, useUpvote } from "@/hooks/use-upvote";

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

export function FeedbackList({ feedbacks = [] }: { feedbacks: Feedback[] }) {
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
          <Card className="border rounded-md py-0" key={f.id}>
            <div className="flex gap-2 h-full">
              <div className="h-full py-4 bg-accent/30">
                <UpvoteProvider>
                  <UpvoteComponent itemId={f.id} />
                </UpvoteProvider>
              </div>
              <div className="flex-1 w-full py-4">
                <CardHeader className="pl-0">
                  <CardTitle>{f.subject}</CardTitle>
                  <span className="mt-1 text-xs text-card-foreground">
                    {f.title}
                  </span>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>

                {f.team && (
                  <CardFooter className="px-2 pt-3 flex items-center justify-between">
                    <div className="*:data-[slot=avatar]:ring-accent flex -space-x-2 *:data-[slot=avatar]:ring-2">
                      {f?.team.map((t) => (
                        <Avatar key={t.id}>
                          <AvatarImage
                            src={t.avatar}
                            alt={t.avatar.slice(2, 4).toUpperCase()}
                          />
                          <AvatarFallback>
                            {t.avatar.slice(2, 4).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </CardFooter>
                )}
              </div>
            </div>
          </Card>
        ))}
      </>
    </section>
  );
}

function UpvoteComponent({ itemId }: { itemId: string }) {
  const {
    upvoteCount,
    userVoteState,
    upvote,
    downvote,
    canUpvote,
    canDownvote,
  } = useUpvote();

  const handleUpvote = () => {
    upvote(itemId);
  };

  const handleDownvote = () => {
    downvote(itemId);
  };
  return (
    <div className="flex flex-col items-stretch px-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleUpvote}
        disabled={!canUpvote && userVoteState !== "upvoted"}
        className={`${
          userVoteState === "upvoted"
            ? "bg-green-500/20 text-green-500/90"
            : "hover:bg-green-50"
        }`}
        title={
          userVoteState === "upvoted"
            ? "Cliquez pour annuler votre vote positif"
            : "Voter positivement"
        }
      >
        <ChevronUp />
      </Button>
      <span
        className={`text-3xl text-primary font-light border-primary text-center ${
          upvoteCount > 0
            ? "text-green-600"
            : upvoteCount < 0
              ? "current"
              : "text-gray-600 "
        }`}
      >
        {upvoteCount > 0 ? upvoteCount : upvoteCount}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownvote}
        disabled={!canDownvote && userVoteState !== "downvoted"}
        className={`${
          userVoteState === "downvoted"
            ? "bg-destructive/20 text-destructive/90"
            : "hover:bg-red-50"
        }`}
        title={
          userVoteState === "downvoted"
            ? "Cliquez pour annuler votre vote négatif"
            : "Voter négativement"
        }
      >
        <ChevronDown />
      </Button>
    </div>
  );
}
