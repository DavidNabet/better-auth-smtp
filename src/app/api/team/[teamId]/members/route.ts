import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // P1.2 — IDOR : résoudre l'org de la team, 404 si introuvable, 403 si non membre.
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { organizationId: true },
  });
  if (!team) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isMember = await db.member.findFirst({
    where: { organizationId: team.organizationId, userId: session.user.id },
  });
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit")) || 50, 100));

  const members = await db.teamMember.findMany({
    where: { teamId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      team: {
        select: { organizationId: true },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          members: {
            where: { role: { not: "member" } },
            select: {
              role: true,
              organizationId: true,
            },
          },
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (members.length > limit) {
    const next = members.pop();
    nextCursor = next!.id;
  }

  const formatted = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    organizationId: m.team.organizationId,
    role: m.user.members[0]?.role ?? "member",
    createdAt: m.createdAt,
    updatedAt: m.createdAt,
  }));

  return NextResponse.json(
    {
      members: formatted,
      nextCursor,
      total: formatted.length,
    },
    { status: 200 },
  );
}
