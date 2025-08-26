import {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
} from "react";

import { Notification } from "@/types";
import api from "@/config/api";
import { isAuthenticated } from "@/config/auth";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }

  return context;
};

export const useNotificationContext = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/api/notifications");
      const fetchedNotifications = response.data;

      setNotifications(fetchedNotifications);
      setUnreadCount(
        fetchedNotifications.filter((n: Notification) => !n.isRead).length
      );
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) => {
        const deleted = prev.find((n) => n.id === notificationId);

        if (deleted && !deleted.isRead) {
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
        }

        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete("/api/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated()) return;

    const connectWebSocket = () => {
      try {
        // Use native WebSocket instead of STOMP for simplicity
        const socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);

          // Get current user ID from JWT token
          const token = localStorage.getItem("jwt");

          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              const userId = payload.sub || payload.userId;

              if (userId) {
                // Send subscription message to the server
                socket.send(
                  JSON.stringify({
                    type: "SUBSCRIBE",
                    destination: `/topic/notifications/${userId}`,
                  })
                );
              }
            } catch (err) {
              console.error("Failed to decode JWT token:", err);
            }
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "NOTIFICATION") {
              const notification = data.payload;

              console.log("Received notification:", notification);

              setNotifications((prev) => [notification, ...prev]);
              if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1);
              }
            } else if (data.type === "SUBSCRIBED") {
              console.log(
                "Successfully subscribed to notifications:",
                data.message
              );
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        socket.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          // Reconnect after a delay
          setTimeout(connectWebSocket, 5000);
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        setWs(socket);
      } catch (err) {
        console.error("Failed to connect WebSocket:", err);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading,
    error,
    isConnected,
  };
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationContext = useNotificationContext();

  return (
    <NotificationContext.Provider value={notificationContext}>
      {children}
    </NotificationContext.Provider>
  );
};
