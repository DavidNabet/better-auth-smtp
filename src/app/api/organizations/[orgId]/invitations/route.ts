import { db } from "@/db";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // P1.2 — IDOR : non membre => 403 (au lieu de 401).
  const isMember = await db.member.findFirst({
    where: { organizationId: orgId, userId: session.user.id },
  });
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit")) || 5, 100);

  const invitations = await db.invitation.findMany({
    where: { organizationId: orgId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      organizationId: true,
      role: true,
      createdAt: true,
      expiresAt: true,
      inviterId: true,
      status: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (invitations.length > limit) {
    const next = invitations.pop();
    nextCursor = next!.id;
  }

  revalidateTag(`invitations:${orgId}`);

  return NextResponse.json(
    {
      invitations,
      nextCursor,
      total: invitations.length,
    },
    { status: 200 },
  );
}
