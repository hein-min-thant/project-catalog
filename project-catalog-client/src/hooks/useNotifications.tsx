import type { Notification } from "@/types";

import {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
  useRef,
} from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
  connectionStatus: "connected" | "disconnected" | "connecting" | "error";
  reconnect: () => void;
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
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting" | "error"
  >("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Get WebSocket URL from
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const getWebSocketUrl = useCallback(() => {
    const apiBaseUrl = api.defaults.baseURL || "http://localhost:8080";
    return apiBaseUrl + "/ws";
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/api/notifications");
      const fetchedNotifications: Notification[] = response.data;

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

  const connectStomp = useCallback(async () => {
    if (!isAuthenticated()) {
      console.log("User not authenticated");
      return;
    }

    // 👉 Step 1: Fetch userId FIRST, before creating STOMP client
    let userId: number;
    try {
      const response = await api.get("/users/me");
      userId = response.data.id;
      console.log(`👤 User ID for STOMP: ${userId}`);
    } catch (err) {
      console.error("❌ Failed to fetch user ID:", err);
      setConnectionStatus("error");
      return;
    }

    // 👉 Step 2: Now create and configure STOMP client
    try {
      const socketUrl = getWebSocketUrl();
      const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        debug: (str) => console.log("STOMP:", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Remove the local 'let subscription: StompSubscription | null = null;' line
      client.onConnect = () => {
        console.log("✅ STOMP connected successfully!");
        setConnectionStatus("connected");
        setReconnectAttempts(0);

        // ✅ Use subscriptionRef.current to check and manage subscription
        if (!subscriptionRef.current) {
          // <-- Check ref instead of local var
          console.log(`📡 Subscribing to /topic/notifications/${userId}`);
          const newSubscription = client.subscribe(
            // <-- Assign to a new const
            `/topic/notifications/${userId}`,
            (message: IMessage) => {
              try {
                const notification: Notification = JSON.parse(message.body);
                console.log("🔔 New notification received:", notification);

                setNotifications((prev) => {
                  // Check for duplicates before adding (Safety net)
                  if (prev.some((n) => n.id === notification.id)) {
                    console.warn(
                      "Duplicate notification ID received, ignoring:",
                      notification.id
                    );
                    return prev;
                  }
                  // Add new notification to the beginning of the list
                  return [notification, ...prev];
                });

                if (!notification.isRead) {
                  setUnreadCount((prev) => prev + 1);
                }
              } catch (err) {
                console.error("❌ Failed to parse message:", err);
              }
            }
          );
          // Store the new subscription in the ref
          subscriptionRef.current = newSubscription; // <-- Store in ref
        } else {
          console.log("Already subscribed, skipping new subscription.");
        }

        // Fetch initial notifications only on first connect
        if (reconnectAttempts === 0) {
          fetchNotifications();
        }
      };

      client.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame);
        setConnectionStatus("error");
      };

      client.onWebSocketClose = () => {
        console.log("🔌 STOMP connection closed");
        setConnectionStatus("disconnected");
        setReconnectAttempts((prev) => prev + 1);
        // Clear the subscription ref on close
        subscriptionRef.current = null; // <-- Clear ref on close
      };

      client.onWebSocketError = (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionStatus("error");
      };

      client.activate();
      setStompClient(client);

      return () => {
        console.log(
          "🧹 Cleaning up STOMP connection (connectStomp cleanup)..."
        );

        if (subscriptionRef.current) {
          console.log("Unsubscribing via ref...");
          try {
            subscriptionRef.current.unsubscribe();
          } catch (e) {
            console.warn("Error during unsubscribe in cleanup:", e);
          }
          subscriptionRef.current = null;
        }

        if (client && client.active) {
          console.log("Deactivating client...");
          client.deactivate();
        }
      };
    } catch (err) {
      console.error("❌ STOMP setup failed:", err);
      setConnectionStatus("error");
    }
  }, [getWebSocketUrl, reconnectAttempts, fetchNotifications]);
  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnection requested");
    setReconnectAttempts(0);
    if (subscriptionRef.current) {
      console.log("Unsubscribing via ref (reconnect)...");
      try {
        subscriptionRef.current.unsubscribe();
      } catch (e) {
        console.warn("Error during unsubscribe in reconnect:", e);
      }
      subscriptionRef.current = null;
    }

    if (stompClient) {
      if (stompClient.connected) {
        console.log("Deactivating connected client (reconnect)...");
        stompClient.deactivate();
      } else {
        console.log("Client not connected, clearing state (reconnect)...");
        setStompClient(null);
        setConnectionStatus("disconnected");
      }
    }

    setTimeout(() => connectStomp(), 1000);
  }, [connectStomp, stompClient]);

  useEffect(() => {
    console.log("🚀 Initializing STOMP connection useEffect...");
    let cleanupFn: (() => void) | undefined;

    connectStomp().then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      console.log(
        "🛑 Cleaning up STOMP connection (main useEffect cleanup)..."
      );

      if (cleanupFn) {
        console.log("Calling cleanup function returned by connectStomp...");
        cleanupFn();
      }

      if (subscriptionRef.current) {
        console.warn(
          "Subscription ref still active in main useEffect cleanup, forcing unsubscribe."
        );
        try {
          subscriptionRef.current.unsubscribe();
        } catch (e) {
          console.warn(
            "Error forcing unsubscribe in main useEffect cleanup:",
            e
          );
        }
        subscriptionRef.current = null;
      }
    };
  }, [connectStomp]);
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading,
    error,
    isConnected: connectionStatus === "connected",
    connectionStatus,
    reconnect,
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
