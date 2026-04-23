import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  const { invitationId } = await params;

  try {
    const data = await auth.api.acceptInvitation({
      body: {
        invitationId,
      },
      headers: await headers(),
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.body);
    }
    return NextResponse.redirect(
      new URL("/auth/signup?error=invitation_not_found", req.url),
    );
  }
}
