"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { APIError } from "better-auth/api";

type VoteState = "none" | "upvoted" | "downvoted";

interface UpvoteContextType {
  upvoteCount: number;
  userVoteState: VoteState;
  upvote: (id: string) => void;
  downvote: (id: string) => void;
  canUpvote: boolean;
  canDownvote: boolean;
}

export const UpvoteContext = createContext<UpvoteContextType | undefined>(
  undefined
);

export function useUpvoteState() {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [userVoteState, setUserVoteState] = useState<VoteState>("none");

  async function upvote(id: string) {
    // Si l'utilisateur n'a pas encore voté, on ajoute un upvote
    if (userVoteState === "none") {
      setUpvoteCount((prev) => prev + 1);
      setUserVoteState("upvoted");
    }
    // Si l'utilisateur avait downvoté, on annule le downvote et on ajoute un upvote
    else if (userVoteState === "downvoted") {
      setUpvoteCount((prev) => prev + 2); // +1 pour annuler le downvote, +1 pour l'upvote
      setUserVoteState("upvoted");
    }
    // Si l'utilisateur avait déjà upvoté, on annule l'upvote
    else if (userVoteState === "upvoted") {
      setUpvoteCount((prev) => prev - 1);
      setUserVoteState("none");
    }
  }

  async function downvote(id: string) {
    // Si l'utilisateur n'a pas encore voté, on ajoute un downvote
    if (userVoteState === "none") {
      setUpvoteCount((prev) => prev - 1);
      setUserVoteState("downvoted");
    }
    // Si l'utilisateur avait upvoté, on annule l'upvote et on ajoute un downvote
    else if (userVoteState === "upvoted") {
      setUpvoteCount((prev) => prev - 2); // -1 pour annuler l'upvote, -1 pour le downvote
      setUserVoteState("downvoted");
    }
    // Si l'utilisateur avait déjà downvoté, on annule le downvote
    else if (userVoteState === "downvoted") {
      setUpvoteCount((prev) => prev + 1);
      setUserVoteState("none");
    }
  }

  const canUpvote = userVoteState !== "upvoted";
  const canDownvote = userVoteState !== "downvoted";

  return {
    upvoteCount,
    userVoteState,
    upvote,
    downvote,
    canUpvote,
    canDownvote,
  };
}

export function UpvoteProvider({ children }: { children: ReactNode }) {
  const upvote = useUpvoteState();
  return (
    <UpvoteContext.Provider value={upvote}>{children}</UpvoteContext.Provider>
  );
}

export function useUpvote() {
  const upvote = useContext(UpvoteContext);

  if (!upvote) {
    throw new Error("Upvote context is not provided");
  }
  return upvote;
}
