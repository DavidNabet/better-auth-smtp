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
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
      const socketInstance = io("http://localhost:3005");

      socketInstance.on("connect", () => {
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
    handleInit();
  }, [s?.user.notificationStatus]);

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

    handleJoinRoom();
  }, [socket, s?.session.userId, error, isRefetching, refetch]);

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

  return {
    socket,
    isConnected,
  };
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const ctx = useSocketContext();
  return (
    <SocketContext.Provider value={ctx}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must bet used within a SocketProvider");
  }

  return context;
};
