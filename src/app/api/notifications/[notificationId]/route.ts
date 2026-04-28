import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { notificationId } = await params;
    const notification = await db.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        status: "accepted",
      },
    });
    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
