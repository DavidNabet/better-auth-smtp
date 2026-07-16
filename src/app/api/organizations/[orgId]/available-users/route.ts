import { db } from "@/db";
import { auth } from "@/lib/auth";
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

  // P1.2 — IDOR/énumération : scope l'endpoint à l'org du caller.
  // Non membre => 403 (ferme l'énumération à l'échelle de l'app).
  const isMember = await db.member.findFirst({
    where: { organizationId: orgId, userId: session.user.id },
  });
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  // Get member userIds to exclude
  const memberUserIds = await db.member.findMany({
    where: { organizationId: orgId },
    select: { userId: true },
  });

  const excludeIds = memberUserIds.map((m) => m.userId);

  const users = await db.user.findMany({
    where: {
      id: { notIn: excludeIds },
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      users,
      total: users.length,
    },
    { status: 200 },
  );
}
