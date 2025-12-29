import { Suspense } from "react";
import AppHeader from "./_components/header";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import { Metadata } from "next";
import { getAppBySlug } from "@/lib/app/app.utils";
import { decodeSlug } from "@/lib/utils";
import { getCurrentUser } from "@/lib/user/user.utils";

export const metadata: Metadata = {
  title: "App Details",
};

// export const dynamicParams = true;
export async function generateStaticParams() {
  return [{ slug: "/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/" }];
}
export default async function AppDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const details = await getAppBySlug(slug);
  if (!details) return <div>App Introuvable!</div>;
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px]">
      <Wrapper title="App details">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <AppHeader app={details} />
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
