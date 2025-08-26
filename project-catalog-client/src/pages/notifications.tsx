// NotificationsPage.tsx  (visual-only refactor)
// —————— logic untouched ——————

import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@heroui/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types";
import DefaultLayout from "@/layouts/default"; // ← wrap with DefaultLayout

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading,
    error,
  } = useNotifications();

  const [filter, setFilter] = useState<
    "all" | "unread" | "comments" | "approvals" | "rejections"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filteredNotifications = notifications
    .filter((notification) => {
      if (filter === "unread") return !notification.isRead;
      if (filter === "comments") return notification.type === "COMMENT";
      if (filter === "approvals") return notification.type === "APPROVAL";
      if (filter === "rejections") return notification.type === "REJECTION";

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "APPROVAL":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTION":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "border-l-blue-500 bg-blue-50/50";
      case "APPROVAL":
        return "border-l-green-500 bg-green-50/50";
      case "REJECTION":
        return "border-l-red-500 bg-red-50/50";
      default:
        return "border-l-gray-500 bg-gray-50/50";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "Comment";
      case "APPROVAL":
        return "Approval";
      case "REJECTION":
        return "Rejection";
      default:
        return "Notification";
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) await markAsRead(notification.id);
    if (notification.projectId)
      window.location.href = `/projects/${notification.projectId}`;
  };

  if (error) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-card/60 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Notifications
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-500">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </header>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              className="text-red-600 hover:text-red-700"
              variant="outline"
              onClick={clearAllNotifications}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear all
            </Button>
          )}
        </div>

        {/* Filters & Sort */}
        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filter</span>
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
                <SelectItem value="approvals">Approvals</SelectItem>
                <SelectItem value="rejections">Rejections</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm font-medium">Sort</span>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notifications list */}
        {isLoading ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardContent className="p-8 text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-muted-foreground">Loading…</p>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "You're all caught up!"
                  : `No ${filter} notifications.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  notification.isRead ? "opacity-75" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs" variant="secondary">
                        {getTypeLabel(notification.type)}
                      </Badge>
                      {!notification.isRead && (
                        <Badge className="text-xs" variant="default">
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="font-medium text-sm">
                      {notification.message}
                    </p>

                    {notification.projectTitle && (
                      <p className="text-sm text-muted-foreground">
                        Project: {notification.projectTitle}
                      </p>
                    )}
                    {notification.commentText && (
                      <p className="text-sm italic text-muted-foreground">
                        &quot;{notification.commentText}&quot;
                      </p>
                    )}
                    {notification.rejectionReason && (
                      <p className="text-sm text-red-600">
                        Reason: {notification.rejectionReason}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {!notification.isRead && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      className="text-red-500 hover:text-red-700"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
