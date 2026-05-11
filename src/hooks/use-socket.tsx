"use client";

import { Notification } from "@prisma/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { getCurrentClientSession } from "@/lib/session/client";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {
    data: s,
    isPending,
    error,
    isRefetching,
    refetch,
  } = getCurrentClientSession();

  // évite les appels dupliqués des notifications statut pending
  const hasFetchedPendingRef = useRef(false);
  // évite les refetch en boucle infinie
  const hasAttemptedRefetchRef = useRef(false);

  useEffect(() => {
    if (!s) return;
    async function handleInit() {
      const socketInstance = io("http://localhost:3005", {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true,
      });
      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
    if (!!s?.user.notificationStatus) {
      handleInit();
    }
  }, [s, s?.user.notificationStatus]);

  // Listen for join the room after the login
  useEffect(() => {
    async function handleJoinRoom() {
      if (s?.session.userId && socket) {
        socket.emit("join_room", {
          userId: s?.session.userId,
        });
        console.log(`Requête de join pour room user_${s?.session.userId}`);
        hasAttemptedRefetchRef.current = false;
      } else if (socket && !s && error && !hasAttemptedRefetchRef.current) {
        console.warn(
          "Session invalide ou manquante. Tentative de refetch la session",
        );
        hasAttemptedRefetchRef.current = true;
        refetch();
      }
    }
    if (!!s?.user.notificationStatus) {
      handleJoinRoom();
    }
  }, [
    socket,
    s?.session.userId,
    error,
    isRefetching,
    refetch,
    s?.user.notificationStatus,
  ]);

  // Fetch pending notifications for the user
  useEffect(() => {
    async function handlePendingNotifications() {
      if (s?.user.id && socket && !hasFetchedPendingRef.current && !isPending) {
        hasFetchedPendingRef.current = true;
        fetchPendingNotifications(s.user.id)
          .then((pendingNotifications: Notification[]) => {
            if (pendingNotifications.length > 0) {
              console.log("Pending notifications:", pendingNotifications);
              socket.emit("show_pending_toast", {
                userId: s.user.id,
                notifications: pendingNotifications,
              });
            }
          })
          .catch((err) => {
            console.error(
              "Erreur lors de la récupération des notifs pending:",
              err,
            );
            if (err.status === 401 && !hasAttemptedRefetchRef.current) {
              console.warn(
                "Erreur 401: session invalide. Tentative de refetch de la session...",
              );
              hasAttemptedRefetchRef.current = true;
              refetch();
            }
          });
      }
    }
    if (!!s?.user.notificationStatus) {
      handlePendingNotifications();
    }
  }, [
    s?.user.id,
    socket,
    isPending,
    isRefetching,
    refetch,
    s?.user.notificationStatus,
  ]);

  function connect(socket: Socket) {
    if (socket.disconnected) socket.connect();
    socket.connect();
  }

  function disconnect(socket: Socket) {
    if (socket.connected) socket.disconnect();
  }

  async function fetchPendingNotifications(
    userId: string,
  ): Promise<Notification[]> {
    const response = await fetch(
      `/api/notifications?userId=${userId}&status=pending`,
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return response.json();
  }

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must bet used within a SocketProvider");
  }

  return context.socket;
};
