"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (content: string) => void;
}

export default function CommentSection({
  comments,
  onAddComment,
}: CommentSectionProps) {
  return (
    <section className="space-y-6">
      <div className="border-accent border-t pt-12">
        <h2 className="text-foreground mb-8 flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
        {/* Comment Form */}
        <form className="bg-card border-accent mb-12 rounded-xl border p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              className="border-accent focus:border-primary min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        </form>

        {/* Comment List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border-accent hover:bg-accent rounded-xl border p-6 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={comment.author.avatar}
                    alt={comment.author.name}
                  />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span>
                      <p className="text-foreground font-medium">
                        {comment.author.name}
                      </p>
                      <p className="text-accent-foreground text-sm">
                        {comment.timestamp}
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
                    >
                      <Heart className="h-4 w-4" />
                      {comment.likes}
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
