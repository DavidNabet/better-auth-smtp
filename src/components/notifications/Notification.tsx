"use client";
import { InboxButton } from "better-inbox/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth.client";

export default function Notification() {
  const router = useRouter();
  return (
    <>
      <InboxButton
        client={authClient}
        onNavigate={(href) => router.push(href)}
      />
    </>
  );
}
