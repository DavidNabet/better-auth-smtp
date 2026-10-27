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

  // Get apps by organization
  const apps = await db.app.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      logo: true,
      name: true,
      slug: true,
    },
  });

  return NextResponse.json(
    {
      apps,
      total: apps.length,
    },
    { status: 200 },
  );
}
