"use client";

import { toggleVote } from "@/lib/feedback/feedback.action";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useTransition,
} from "react";

type Vote = {
  feedbackId: string;
  upvote: number;
  downvote: number;
  userVote?: "UP" | "DOWN";
};

interface VoteContextType {
  votes: Record<string, Vote>;
  handleVote: (feedbackId: string, type: "UP" | "DOWN") => void;
  isPending: boolean;
}

export const VoteContext = createContext<VoteContextType | undefined>(
  undefined
);

export function VoteProvider({
  children,
  initialVotes,
}: {
  children: ReactNode;
  initialVotes: Vote[];
}) {
  // conversion des downvotes en négatifs dès l'initialisation
  const [votes, setVotes] = useState<Record<string, Vote>>(
    Object.fromEntries(
      initialVotes.map((v) => [
        v.feedbackId,
        { ...v, downvote: v.downvote > 0 ? -v.downvote : v.downvote },
      ])
    )
  );

  const [isPending, startTransition] = useTransition();

  function handleVote(feedbackId: string, type: "UP" | "DOWN") {
    startTransition(async () => {
      const result = await toggleVote(feedbackId, type);

      setVotes((prev) => {
        const current = prev[feedbackId];

        if (!current) return prev;
        let upCount = current.upvote;
        let downCount = current.downvote;
        let userVote = current.userVote;

        if (result.status === "added") {
          if (type === "UP") upCount++;
          else downCount--; //downvote devient plus négatif
          userVote = type;
        }

        if (result.status === "removed") {
          if (type === "UP") upCount--;
          else downCount++; // remonter vers 0
          userVote = undefined;
        }

        if (result.status === "updated") {
          if (type === "UP") {
            upCount++;
            downCount++; // enlever un downvote
          } else {
            downCount--;
            upCount--; // enlever un upvote
          }
          userVote = type;
        }

        return {
          ...prev,
          [feedbackId]: {
            ...current,
            upvote: upCount,
            downvote: downCount,
            userVote,
          },
        };
      });
    });
  }

  return (
    <VoteContext.Provider value={{ votes, handleVote, isPending }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVotes() {
  const upvote = useContext(VoteContext);

  if (!upvote) {
    throw new Error("Vote context is not provided");
  }
  return upvote;
}
