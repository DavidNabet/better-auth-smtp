import { Metadata } from "next";
import Header from "./_components/header";
import Content from "./_components/content";
import { CommentForm, CommentItem } from "./_components/comment";
import {
  getCommentsTree,
  getFeedbackWithComments,
} from "@/lib/feedback/feedback.utils";
import { decodeSlug } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Details",
  description: "Idea and suggestions details.",
};

// Create feedback details
export async function generateStaticParams() {
  return [{ slug: "/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/" }];
}

export default async function FeedbackDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const details = await getFeedbackWithComments(decodeSlug(slug));
  if (!details) return <div>Feedback Introuvable!</div>;
  return (
    <section className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Header
          category={details.feedback?.subject!}
          title={details.feedback?.title!}
          author={details.feedback?.author!}
          publishedDate={details.feedback?.createdAt.toLocaleDateString()!}
        />
        <div className="mt-16">
          <Content content={[details.feedback?.description!]} />
        </div>
        <div className="mt-16">
          <CommentTree feedbackId={details.feedback.id} />
        </div>
      </div>
    </section>
  );
}

async function CommentTree({ feedbackId }: { feedbackId: string }) {
  const { comments, roots } = await getCommentsTree(feedbackId);
  return (
    <section className="space-y-6">
      <div className="border-accent border-t pt-12">
        <h2 className="text-foreground mb-8 flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
        {/* Comment Form */}
        <CommentForm feedbackId={feedbackId} />

        {/* Comment List */}
        <ul className="space-y-6">
          {roots.map((comment, idx) => {
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                feedbackId={feedbackId}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
}
