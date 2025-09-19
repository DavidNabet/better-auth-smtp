import Wrapper from "@/app/_components/Wrapper";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Feedback, FeedbackList } from "@/components/feedback/FeedbackList";
import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { db } from "@/db";
// import { UpvoteProvider } from "@/hooks/use-upvote";

export default async function FeedbacksPage() {
  // MVP idea-style
  const feedbacks = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      subject: true,
      description: true,
      upvotes: true,
      updatedAt: true,
      authorId: true,
    },
  });
  const feedbackData: Feedback[] = [
    {
      id: "mvp_001",
      title: "Product Team",
      date: new Date("2025-09-01").toISOString(),
      subject: "Onboarding checklist",
      description:
        "Provide a lightweight onboarding checklist with 4–6 steps (profile, invite teammate, create first project, connect integration).",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_002",
      title: "Design",
      date: new Date("2025-09-02").toISOString(),
      subject: "Dark mode toggle",
      description:
        "Add a simple theme toggle persisted per user. No scheduling—just system and manual modes for now.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_003",
      title: "Customer Success",
      date: new Date("2025-09-03").toISOString(),
      subject: "In-app feedback widget",
      description:
        "Basic modal with subject + description + optional screenshot upload. Sends to a feedback inbox.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_004",
      title: "Engineering",
      date: new Date("2025-09-03").toISOString(),
      subject: "Email-based invites",
      description:
        "Allow admins to invite teammates by email with role selection (viewer/editor). One-time magic link.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_005",
      title: "Analytics",
      date: new Date("2025-09-04").toISOString(),
      subject: "Usage snapshot",
      description:
        "Minimal dashboard: daily active users, projects created this week, and top 3 engaged features.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_006",
      title: "Support",
      date: new Date("2025-09-05").toISOString(),
      subject: "Saved replies",
      description:
        "Allow saving canned responses for common support questions; simple insertion in the reply editor.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_007",
      title: "Growth",
      date: new Date("2025-09-06").toISOString(),
      subject: "CSV export",
      description:
        "Export core entities to CSV: projects and feedback. No scheduling, just on-demand download.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
    {
      id: "mvp_008",
      title: "Security",
      date: new Date("2025-09-07").toISOString(),
      subject: "Passwordless login",
      description:
        "Magic link sign-in via email. Keep traditional password flow behind a feature flag.",
      team: [
        { id: 1, avatar: "https://avatar.iran.liara.run/public" },
        { id: 2, avatar: "https://avatar.iran.liara.run/public" },
        { id: 3, avatar: "https://avatar.iran.liara.run/public" },
      ],
    },
  ];

  return (
    <Wrapper title="Welcome to the users ideas">
      <div className="flex justify-end items-center my-4">
        <FeedbackForm />
      </div>
      <Suspense fallback={<LoadingIcon />}>
        <FeedbackList feedbacks={feedbacks} />
      </Suspense>
    </Wrapper>
  );
}
