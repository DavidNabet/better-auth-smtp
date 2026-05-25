import { Server, Socket } from "socket.io";

const socketHandler = (socket: Socket, io: Server): void => {
  console.log("⚡ A user connected: ", socket.id);

  const userId = socket.handshake.auth.userId;

  socket.on("tenant_room", () => {
    if (!userId) {
      console.warn("join_room: userId manquant");
      return;
    }
    socket.join(`tenant:${userId}`);
    console.log(`Socket ${socket.id} a rejoint la room tenant:${userId}`);
  });

  /**
   * Notifications ON au login
   */
  socket.on("notifications:subscribe", () => {
    socket.join(`tenant:${userId}:notifications`);
    console.log("✅ subscribed notifications");
  });
  /**
   * Notifications OFF au login
   */
  socket.on("notifications:unsubscribe", () => {
    socket.leave(`tenant:${userId}:notifications`);

    console.log("❌ unsubscribe notifications");
  });

  socket.on("message", (msg: string) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("show_pending_toast", (data) => {
    if (!data.userId || !Array.isArray(data.notifications)) {
      console.warn("show_pending_toast: données invalides");
      return;
    }
    console.log(
      "Emitting show_pending_toast for userId:",
      data.userId,
      "with notifications:",
      data.notifications,
    );

    // Récupère le message de la première notification (ou un message par défaut si vide)
    const toastMessage =
      data.notifications?.[0]?.message ||
      "Vous avez des notifications en attente.";
    // Relaye l'événement à tous les clients connectés de l'utilisateur
    io.to(`tenant:${data.userId}:notifications`).emit("display_toast", {
      message: toastMessage,
      notifications: data.notifications,
    });

    // Chaque notification via "message" est ajouter côté client
    data.notifications.forEach((notification: any) => {
      io.to(`tenant:${data.userId}:notifications`).emit(
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
