import AppHeader from "./_components/header";
import Wrapper from "@/app/_components/Wrapper";
import { Metadata } from "next";
import { getAppBySlug } from "@/lib/app/app.utils";
import { Users, MessageSquare, ChevronRightSquare } from "lucide-react";
import Stats, { StatProps } from "./_components/stats";
import { Card, CardContent } from "@/components/ui/card";
import Activity from "./_components/activity";

export const metadata: Metadata = {
  title: "App Details",
};

// export const dynamicParams = true;
export async function generateStaticParams() {
  return [{ slug: "/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/" }];
}
export default async function AppDetail(
  props: PageProps<"/dashboard/apps/[slug]">,
) {
  const { slug } = await props.params;
  const details = await getAppBySlug(slug);
  if (!details) return <div>App Introuvable!</div>;
  console.log("details: ", details);
  const tab: StatProps[] = [
    {
      title: "Projects associated",
      stat: details.feedbacks.length,
      status: "within",
      range: "Dans la moyenne",
      icon: <ChevronRightSquare className="text-primary size-5" />,
    },
    {
      title: "Team Members",
      stat: details.organization.members.length,
      status: "exceed",
      range: "Target: 6",
      icon: <Users className="text-primary size-5" />,
    },
    {
      title: "Satisfaction Rate",
      stat: "99%",
      status: "observe",
      range: "Q3 Rate Satisfy",
      icon: <ChevronRightSquare className="text-primary size-5" />,
    },
    {
      title: "Vote Rate",
      // stat: details.feedbacks.map((f) => f.votes.length),
      stat: 3,
      status: "unknown",
      range: "Q4 Review Pending",
      icon: <MessageSquare className="text-primary size-5" />,
    },
  ];
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-350">
      <Wrapper title="App details">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <AppHeader app={details} />
          </div>
          {/* Main Content */}
          <div className="space-y-6 md:col-span-3">
            <div className="grid gap-4 sm:grid-cols-4">
              {tab.map((item: StatProps) => (
                <Stats key={item.title} {...item} />
              ))}
            </div>

            <Card className="p-0">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                <div className="space-y-4">
                  {details.feedbacks.length > 0 ? (
                    details.feedbacks.map((item) => (
                      <Activity
                        key={item.id}
                        title={item.title}
                        activeAt={item.updatedAt}
                        href={item.title}
                      />
                    ))
                  ) : (
                    <p>Aucune activité actuelle.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
