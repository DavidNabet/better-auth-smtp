"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Monitor, Smartphone, Trash2 } from "lucide-react";
import { Session } from "@/lib/auth";
import { UAParser } from "ua-parser-js";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ActiveSessions({
  data,
  activeSessions,
}: {
  data: Session | null;
  activeSessions: Session["session"][];
}) {
  const [isRevoking, setIsRevoking] = useState<string | undefined>(undefined);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="size-5 text-muted-foreground" />
          <h3 className="font-semibold text-base">Active Sessions</h3>
        </div>
        {activeSessions.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="outline"
              >
                Revoke All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out from all devices except this one.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Revoke All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {activeSessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No active sessions</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeSessions.map((session) => (
            <div
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
              key={session.id}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {new UAParser(session.userAgent || "").getDevice().type ===
                  "mobile" ? (
                    <Smartphone className="size-5" />
                  ) : (
                    <Monitor className="size-5" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">
                      {new UAParser(session.userAgent || "").getOS().name}
                    </span>
                    {session.userId && (
                      <Badge className="text-xs rounded-full" variant="default">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                    <span>{session.ipAddress || "Nothing"}</span>
                    <span>-</span>
                    <span>Active {formatRelativeTime(session.updatedAt)}</span>
                  </div>
                </div>
              </div>
              {!session.token && (
                <Button
                  className="w-full sm:w-auto"
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    setIsRevoking(session.id);
                    const res = await authClient.revokeSession({
                      token: session.token,
                    });
                    if (res.error) {
                      toast.error(res.error.message);
                    } else {
                      toast.success("Session revoking successfully");
                    }
                    router.refresh();
                    setIsRevoking(undefined);
                  }}
                >
                  {isRevoking === session.id ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Revoke
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
