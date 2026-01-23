import { ReactNode } from "react";

interface OrganizationLayoutProps {
  children: ReactNode;
  team: ReactNode;
}
export default function OrganizationLayout({
  children,
  team,
}: OrganizationLayoutProps) {
  return (
    <div>
      {children}
      <div className="grid gap-4 sm:grid-cols-2">{team}</div>
    </div>
  );
}
