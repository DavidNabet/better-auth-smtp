import AppHeader from "./_components/header";
import Wrapper from "@/app/_components/Wrapper";
import { Metadata } from "next";
import { getAppBySlug } from "@/lib/app/app.utils";
import { Star, Users } from "lucide-react";
import Stats, { StatProps } from "./_components/stats";
import { Card, CardContent } from "@/components/ui/card";
import Activity from "./_components/activity";

export const metadata: Metadata = {
  title: "App Details",
};

// export const dynamicParams = true;
// export async function generateStaticParams() {
//   return [{ slug: "/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/" }];
// }
export default async function AppDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const details = await getAppBySlug(slug);
  if (!details) return <div>App Introuvable!</div>;
  const tab = [
    {
      title: "Projects associated",
      stat: details.feedbacks.length,
      icon: <Star className="text-primary size-5" />,
    },
    {
      title: "Team Members",
      stat: details.organization.members.length,
      icon: <Users className="text-primary size-5" />,
    },
    {
      title: "Satisfaction Rate",
      stat: "99%",
      icon: <Star className="text-primary size-5" />,
    },
  ];
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px]">
      <Wrapper title="App details">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <AppHeader app={details} />
          </div>
          {/* Main Content */}
          <div className="space-y-6 md:col-span-3">
            <div className="grid gap-4 sm:grid-cols-3">
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
