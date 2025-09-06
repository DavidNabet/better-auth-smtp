import Wrapper from "@/app/_components/Wrapper";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Feedback, FeedbackList } from "@/components/feedback/FeedbackList";
import { Suspense } from "react";

export default function FeedbacksPage() {
  // MVP idea-style
  const feedbacks: Feedback[] = [
    {
      id: "mvp_001",
      title: "Product Team",
      date: new Date("2025-09-01").toISOString(),
      subject: "Onboarding checklist",
      content:
        "Provide a lightweight onboarding checklist with 4–6 steps (profile, invite teammate, create first project, connect integration).",
      status: "MVP",
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
      content:
        "Add a simple theme toggle persisted per user. No scheduling—just system and manual modes for now.",
      status: "Planned",
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
      content:
        "Basic modal with subject + description + optional screenshot upload. Sends to a feedback inbox.",
      status: "MVP",
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
      content:
        "Allow admins to invite teammates by email with role selection (viewer/editor). One-time magic link.",
      status: "MVP",
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
      content:
        "Minimal dashboard: daily active users, projects created this week, and top 3 engaged features.",
      status: "Backlog",
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
      content:
        "Allow saving canned responses for common support questions; simple insertion in the reply editor.",
      status: "Research",
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
      content:
        "Export core entities to CSV: projects and feedback. No scheduling, just on-demand download.",
      status: "Planned",
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
      content:
        "Magic link sign-in via email. Keep traditional password flow behind a feature flag.",
      status: "Backlog",
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

      <FeedbackList feedbacks={feedbacks} />
    </Wrapper>
  );
}
