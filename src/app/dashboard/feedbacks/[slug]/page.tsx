import { Metadata } from "next";
import Header from "./_components/header";
import Content from "./_components/content";
import CommentSection from "./_components/comment";
import { getFeedbackWithComments } from "@/lib/feedback/feedback.utils";
import { decodeSlug } from "@/lib/utils";

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
  // const details = await getFeedbackByTitle(decodeSlug(slug));
  const details = await getFeedbackWithComments(decodeSlug(slug));
  if (!details) return <div>Feedback Introuvable!</div>;
  const commentsData = [
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg",
      },
      content:
        "This is exactly what I needed! The personalization tips are incredibly valuable. I've been struggling with low open rates, and this gives me a clear direction to improve.",
      timestamp: "2 hours ago",
      likes: false,
    },
    {
      id: "2",
      author: {
        name: "Mike Chen",
        avatar: "/placeholder.svg",
      },
      content:
        "Great insights on email personalization. I especially liked the section about adding elements that spark interest. Have you tested A/B variations of these techniques?",
      timestamp: "5 hours ago",
      likes: false,
    },
    {
      id: "3",
      author: {
        name: "Emily Rodriguez",
        avatar: "/placeholder.svg",
      },
      content:
        "Thanks for sharing this comprehensive guide! The practical examples make it easy to understand how to implement these strategies in our own campaigns.",
      timestamp: "1 day ago",
      likes: true,
    },
  ];
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
          <CommentSection comments={commentsData} details={details} />
        </div>
      </div>
    </section>
  );
}
