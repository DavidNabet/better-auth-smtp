import { Metadata } from "next";
import Navbar from "@/app/_components/Navbar";
import Breadcrumbs from "../_components/Breadcrumb";
import { redirect } from "next/navigation";
import { getCurrentServerSession } from "@/lib/session/server";
import { Switcher } from "@/components/organizations/Switcher";
import { SocketProvider } from "@/hooks/use-socket";

export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard",
    default: "Dashboard",
  },
  description: "Manage your account and settings.",
};

// TODO: if it's owner we change the layout else it's the default layout, and implement roleOrg in getCurrentServerSession if exists for control the layout changes
export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { sessionToken, userId } = await getCurrentServerSession();
  if (!sessionToken) redirect("/auth/signin");

  return (
    <main className="dark:bg-background bg-white">
      <SocketProvider userId={userId}>
        <Navbar />
        <div className="max-w-screen-xl min-h-screen text-primary mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <Breadcrumbs>
            <Switcher />
          </Breadcrumbs>

          {/* your content goes here ... */}
          {children}
        </div>
      </SocketProvider>
    </main>
  );
}
