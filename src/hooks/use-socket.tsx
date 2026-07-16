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
import { Socket } from "socket.io-client";
import { getCurrentClientSession } from "@/lib/session/client";
import { socketInstance } from "@/lib/socket";

interface SocketContextType {
  socket: Socket | null;
  userId: string;
  // notificationsEnabled: boolean;
  // setNotificationsEnabled: (value: boolean) => void;
}

type Props = {
  children: ReactNode;
  // notificationsStatus: boolean;
  userId: string;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children, userId }: Props) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {
    data: s,
    isPending,
    error: sessionError,
    isRefetching,
    refetch: refetchSession,
  } = getCurrentClientSession();

  // const [notificationsEnabled, setNotificationsEnabled] =
  //   useState(notificationsStatus);
  // évite les appels dupliqués des notifications statut pending
  const hasFetchedPendingRef = useRef(false);
  // évite les refetch en boucle infinie
  const hasAttemptedRefetchRef = useRef(false);

  // TODO: Mettre en place dans le socketInstance, le session token
  useEffect(() => {
    if (!s) return;
    async function handleInit() {
      if (!socketInstance.connected) {
        socketInstance.connect();
      }
      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
    handleInit();
  }, [s]);

  /* Listen for join the room after the login */
  useEffect(() => {
    async function handleJoinRoom() {
      if (s?.session.userId && socket) {
        socket.emit("tenant_room", {
          userId: s?.session.userId,
        });
        console.log(`Requête de join pour room tenant:${s?.session.userId}`);
        hasAttemptedRefetchRef.current = false;
      } else if (
        socket &&
        !s &&
        sessionError &&
        !hasAttemptedRefetchRef.current
      ) {
        console.warn(
          "Session invalide ou manquante. Tentative de refetch la session",
        );
        hasAttemptedRefetchRef.current = true;
        refetchSession();
      }
    }

    handleJoinRoom();
  }, [socket, s?.session.userId, sessionError, refetchSession]);

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
              refetchSession();
            }
          });
      }
    }
    if (!!s?.user.notificationStatus) {
      handlePendingNotifications();
    }
  }, [s?.user.id, socket, isPending, refetchSession]);

  async function fetchPendingNotifications(
    userId: string,
  ): Promise<Notification[]> {
    const response = await fetch(
      `/api/notifications?userId=${userId}&status=pending`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return response.json();
  }

  return (
    <SocketContext.Provider
      value={{
        userId,
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  console.log(context);
  if (!context) {
    throw new Error("useSocket must bet used within a SocketProvider");
  }

  return context;
};
