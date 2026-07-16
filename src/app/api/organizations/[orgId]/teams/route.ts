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

  // const { searchParams } = new URL(req.url);
  // const cursor = searchParams.get("cursor");
  // const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  // Get organizations the current user belongs to
  const memberships = await db.member.findMany({
    where: { userId: session.user.id },
    select: {
      organization: { select: { name: true } },
      organizationId: true,
    },
  });

  const userOrgIds = memberships.map((m) => m.organizationId);

  // If user is not in this organization, return empty
  if (!userOrgIds.includes(orgId)) {
    return [];
  }

  const teams = await db.team.findMany({
    where: {
      organizationId: orgId,
      name: { notIn: memberships.map((m) => m.organization.name) },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      createdAt: true,
      organization: {
        select: { slug: true, id: true },
      },
      teamMembers: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(
    {
      teams,
      total: teams.length,
    },
    { status: 200 },
  );
}
