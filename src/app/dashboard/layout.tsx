import { Metadata } from "next";
import Navbar from "@/app/_components/Navbar";
import Breadcrumbs from "../_components/Breadcrumb";
import { redirect } from "next/navigation";
import { getCurrentServerSession } from "@/lib/session/server";
import { Toaster } from "@/components/ui/sonner";
export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard",
    default: "Dashboard",
  },
  description: "Manage your account and settings.",
};

export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { sessionToken } = await getCurrentServerSession();
  if (!sessionToken) redirect("/auth/signin");
  return (
    <main className="dark:bg-background bg-white">
      <Navbar />
      <div className="max-w-screen-xl min-h-screen text-primary mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        {/* your content goes here ... */}
        {children}
        <Toaster position="bottom-right" richColors />
      </div>
    </main>
  );
}
