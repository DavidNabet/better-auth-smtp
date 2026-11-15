import { betterFetch } from "@better-fetch/fetch";
import { Session } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function getValidatedSession(
  req: NextRequest,
): Promise<Session | null> {
  const { data, error } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: req.nextUrl.origin,
    headers: { cookie: req.headers.get("cookie") || "" },
    credentials: "include",
  });

  if (error) {
    console.log("Session fetch error: ", error);
  }

  return data ?? null;
}

export function attachSessionHeaders(
  req: NextRequest,
  session: Session | null,
): NextRequest {
  const requestHeaders = new Headers(req.headers);
  if (session) {
    requestHeaders.set("x-session-user-id", session.user.id);
    requestHeaders.set("x-session-role", session.user.role);
    requestHeaders.set(
      "x-session-org-id",
      session.session.activeOrganizationId || "",
    );
  }
  return new NextRequest(req.url, {
    headers: requestHeaders,
    method: req.method,
    body: req.body,
  });
}
