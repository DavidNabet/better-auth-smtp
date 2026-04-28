import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentServerSession } from "@/lib/session/server";
import { db } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentServerSession();
    if (!session.userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }
    // Extrait les paramètres de requête
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    // Valide que userId est fourni et correspond à l'utilisateur authentifié
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Paramètre userId requis" },
        { status: 400 },
      );
    }
    if (userId !== session.userId) {
      return NextResponse.json(
        { error: "Accès refusé: userId ne correspond pas à la session" },
        { status: 403 },
      );
    }

    // Construit la requête DB pour filtrer les notifications
    const notifications = await db.notification.findMany({
      where: {
        userId,
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
