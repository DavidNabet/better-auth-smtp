import { Metadata } from "next";
import Navbar from "@/app/_components/Navbar";
import Breadcrumbs from "../_components/Breadcrumb";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your account and settings.",
};

export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="dark:bg-background bg-white">
      <Navbar />
      <div className="max-w-screen-xl min-h-screen text-primary mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        {/* your content goes here ... */}
        {children}
      </div>
    </main>
  );
}
