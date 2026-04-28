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
import { useAuth } from "./use-auth";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { session: s } = useAuth();

  const hasFetchedPendingRef = useRef(false);

  useEffect(() => {
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
  }, [s]);

  // Listen for join the room after the login
  useEffect(() => {
    if (!s) return;
    if (socket) {
      socket.emit("join_room", {
        userId: s.userId,
      });
      console.log(`Requête de join pour room user_${s.userId}`);
    }
  }, [socket, s?.userId]);

  // Fetch pending notifications for the user
  useEffect(() => {
    if (s?.userId && socket && !hasFetchedPendingRef.current) {
      hasFetchedPendingRef.current = true;
      fetchPendingNotifications(s.userId)
        .then((pendingNotifications: Notification[]) => {
          if (pendingNotifications.length > 0) {
            console.log("Pending notifications:", pendingNotifications);
            socket.emit("show_pending_toast", {
              userId: s.userId,
              notifications: pendingNotifications,
            });
          }
        })
        .catch((err) => {
          console.error(
            "Erreur lors de la récupération des notifs pending:",
            err,
          );
        });
    }
  }, [s?.userId, socket]);

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
