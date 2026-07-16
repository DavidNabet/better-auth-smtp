import { Server, Socket } from "socket.io";
import { auth } from "@/lib/auth";

const socketHandler = async (socket: Socket, io: Server): Promise<void> => {
  console.log("⚡ A user connected: ", socket.id);

  // P1.1 — Authentification côté serveur OBLIGATOIRE.
  // La session est résolue depuis le cookie du handshake et NON depuis
  // socket.handshake.auth.userId (contrôlé par le client -> IDOR).
  // better-auth lit `headers.get("cookie")` : on passe un vrai Headers.
  const session = await auth.api.getSession({
    headers: new Headers({ cookie: socket.request.headers.cookie ?? "" }),
  });

  const userId = session?.user?.id;
  if (!userId) {
    // Pas de session valide => déconnexion immédiate SANS enregistrer les handlers.
    socket.disconnect(true);
    return;
  }

  // Identité de confiance, attachée au socket pour tous les handlers.
  socket.data.userId = userId;

  socket.on("tenant_room", () => {
    socket.join(`tenant:${socket.data.userId}`);
    console.log(`Socket ${socket.id} a rejoint la room tenant:${socket.data.userId}`);
  });

  socket.on("notifications:subscribe", () => {
    socket.join(`tenant:${socket.data.userId}:notifications`);
    console.log("✅ subscribed notifications");
  });

  socket.on("notifications:unsubscribe", () => {
    socket.leave(`tenant:${socket.data.userId}:notifications`);
    console.log("❌ unsubscribe notifications");
  });

  // Pas de handler `socket.on("message", …)` : aucun client n'émet `message`.
  // L'ancien broadcast global était un IDOR (un client pouvait diffuser à tous).
  // La délivrance de notifications passe par show_pending_toast -> io.to(room).emit("message", …).

  socket.on("show_pending_toast", (data) => {
    if (!Array.isArray(data?.notifications)) {
      console.warn("show_pending_toast: données invalides");
      return;
    }
    // On cible UNIQUEMENT la room du user authentifié, jamais `data.userId` (client).
    const toastMessage =
      data.notifications?.[0]?.message ||
      "Vous avez des notifications en attente.";
    io.to(`tenant:${socket.data.userId}:notifications`).emit("display_toast", {
      message: toastMessage,
      notifications: data.notifications,
    });
    data.notifications.forEach((notification: any) => {
      io.to(`tenant:${socket.data.userId}:notifications`).emit(
        "message",
        notification,
      );
    });
  });

  socket.on("disconnect", () => {
    console.log("⭐ the user disconnected: ", socket.id);
  });
};

export default socketHandler;
