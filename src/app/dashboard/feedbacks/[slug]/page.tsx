import Header from "./_components/header";
import Content from "./_components/content";
import CommentSection from "./_components/comment";
import { getFeedbackByTitle } from "@/lib/feedback/feedback.utils";

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
  const details = await getFeedbackByTitle(decodeURIComponent(slug));
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
      likes: 12,
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
      likes: 8,
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
      likes: 15,
    },
  ];
  return (
    <section className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Header
          category={details?.subject!}
          title={details?.title!}
          publishedDate={details?.createdAt.toLocaleDateString()!}
        />
        <div className="mt-16">
          <Content content={[details?.description!]} />
        </div>
        <div className="mt-16">
          <CommentSection comments={commentsData} />
        </div>
      </div>
    </section>
  );
}
