"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/auth.client";
import { AnyStatement } from "@/lib/rbac/permissions";

interface ActionGuardProps {
  action: AnyStatement;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ActionGuard({
  action,
  children,
  fallback = null,
}: ActionGuardProps) {
  const { session } = useAuth();
  const [canPerform, setCanPerform] = useState(false);

  useEffect(() => {
    async function fetchPermission() {
      try {
        if (!session) {
          setCanPerform(false);
          return;
        }
        const { data, error } = await authClient.organization.hasPermission({
          permissions: { [action]: [] },
        });
        setCanPerform(!error && data.success !== false);
      } catch {
        setCanPerform(false);
      }
    }
    fetchPermission();
  }, [session, action]);

  if (!session) return <>{fallback}</>;
  return canPerform ? <>{children}</> : <>{fallback}</>;
}
