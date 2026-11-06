"use client";
import { InboxButton } from "@byo-oss/notifications/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth.client";

export default function Notif() {
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
