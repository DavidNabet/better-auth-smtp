import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// TODO: Mettre en place un check d'autorization du role et pas que de la session
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // P1.2 — IDOR : un user authentifié mais non membre ne doit pas lister les membres.
  const isMember = await db.member.findFirst({
    where: { organizationId: orgId, userId: session.user.id },
  });
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit")) || 50, 100));

  const members = await db.member.findMany({
    where: { organizationId: orgId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      createdAt: true,
      id: true,
      organizationId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
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
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    organizationId: m.organizationId,
    role: m.role,
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
