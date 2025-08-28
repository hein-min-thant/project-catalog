/* eslint-disable jsx-a11y/label-has-associated-control */

import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Filter,
  Heart,
  Search,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types";
import DefaultLayout from "@/layouts/default";

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
    | "all"
    | "unread"
    | "comments"
    | "approvals"
    | "rejections"
    | "reactions"
    | "submits"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = notifications
    .filter((notification) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          notification.message.toLowerCase().includes(searchLower) ||
          notification.projectTitle?.toLowerCase().includes(searchLower) ||
          notification.commentText?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Type filter
      if (filter === "unread") return !notification.isRead;
      if (filter === "comments")
        return notification.notificationType === "COMMENT";
      if (filter === "approvals")
        return notification.notificationType === "APPROVAL";
      if (filter === "rejections")
        return notification.notificationType === "REJECTION";
      if (filter === "reactions")
        return notification.notificationType === "REACTION";
      if (filter === "submits")
        return notification.notificationType === "SUBMIT";

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";

    switch (type) {
      case "COMMENT":
        return <MessageSquare className={`${iconClass} text-blue-500`} />;
      case "APPROVAL":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "REJECTION":
        return <XCircle className={`${iconClass} text-red-500`} />;
      case "REACTION":
        return <Heart className={`${iconClass} text-rose-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/50";
      case "APPROVAL":
        return "border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/50";
      case "REJECTION":
        return "border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/50";
      case "REACTION":
        return "border-l-rose-500 bg-gradient-to-r from-rose-50/50 to-transparent dark:from-rose-950/50";
      default:
        return "border-l-gray-500 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-950/50";
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
      case "REACTION":
        return "Reaction";
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
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/50 border-red-200/50 dark:border-red-800/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <Icon
                  className="text-2xl text-red-500"
                  icon="mdi:alert-circle"
                />
              </div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Notifications
              </h2>
              <p className="text-red-600/80 dark:text-red-300/80 mb-6">
                {error}
              </p>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.location.reload()}
              >
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
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Notifications
            </h1>
            <p className="text-lg text-default-600 max-w-2xl mx-auto">
              Stay updated with the latest activity on your projects and
              comments
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 border-cyan-200/50 dark:border-cyan-800/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-3">
                {unreadCount > 0 && (
                  <Button
                    className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50"
                    variant="outline"
                    onClick={markAllAsRead}
                  >
                    <Check className="w-4 h-4 mr-2" /> Mark all as read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    variant="outline"
                    onClick={clearAllNotifications}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear all
                  </Button>
                )}
              </div>

              <div className="text-sm text-default-600">
                {filteredNotifications.length} of {notifications.length}{" "}
                notifications
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Filter className="w-5 h-5 text-cyan-500" />
              </div>
              <h2 className="text-xl font-semibold">Filter & Search</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-500" />
                  Search
                </label>
                <Input
                  className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-cyan-500" />
                  Filter by type
                </label>
                <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                  <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg">
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="unread">Unread only</SelectItem>
                    <SelectItem value="comments">Comments</SelectItem>
                    <SelectItem value="approvals">Approvals</SelectItem>
                    <SelectItem value="rejections">Rejections</SelectItem>
                    <SelectItem value="reactions">Reactions</SelectItem>
                    <SelectItem value="submits">Submits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-500" />
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg">
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {isLoading ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Loading Notifications...
              </h3>
              <p className="text-default-600">
                Please wait while we fetch your notifications
              </p>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Bell className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {searchTerm || filter !== "all"
                  ? "No matching notifications"
                  : "You're all caught up!"}
              </h3>
              <p className="text-default-600 mb-6 max-w-md mx-auto">
                {searchTerm || filter !== "all"
                  ? `No notifications found for your current search criteria. Try adjusting your filters.`
                  : "You have no notifications at the moment. We'll notify you when there's new activity on your projects."}
              </p>
              {(searchTerm || filter !== "all") && (
                <Button
                  className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`group cursor-pointer border-l-4 ${getNotificationColor(notification.notificationType)} ${
                  notification.isRead ? "opacity-80" : "shadow-md"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-2 bg-background/80 dark:bg-gray-800/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      {getNotificationIcon(notification.notificationType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                          {getTypeLabel(notification.notificationType)}
                        </Badge>
                        {!notification.isRead && (
                          <Badge className="text-xs bg-red-500 text-white animate-pulse">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-default-600 ml-auto">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {notification.message}
                      </h3>

                      {notification.projectTitle && (
                        <p className="text-sm text-default-600 mb-2">
                          <span className="font-medium">Project:</span>{" "}
                          {notification.projectTitle}
                        </p>
                      )}

                      {notification.commentText && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-2">
                          <p className="text-sm italic text-default-600">
                            &quot;{notification.commentText}&quot;
                          </p>
                        </div>
                      )}

                      {notification.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            <span className="font-medium">Reason:</span>{" "}
                            {notification.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {!notification.isRead && (
                        <Button
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-950/50 hover:text-green-600"
                          size="sm"
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
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
