import { ReactNode } from "react";

interface OrganizationLayoutProps {
  children: ReactNode;
}
export default function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  return <div className="container">{children}</div>;
}
