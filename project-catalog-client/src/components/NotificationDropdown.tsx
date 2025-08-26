import { useState } from 'react';
import { Bell, Check, Trash2, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Navigate to the project or comment
    if (notification.projectId) {
      window.location.href = `/project/${notification.projectId}`;
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'APPROVAL':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTION':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return 'bg-blue-50 border-blue-200';
      case 'APPROVAL':
        return 'bg-green-50 border-green-200';
      case 'REJECTION':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
        notification.isRead ? 'opacity-60' : ''
      } ${getNotificationColor(notification.type)}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {notification.message}
          </p>
          {notification.projectTitle && (
            <p className="text-xs text-gray-500 mt-1">
              Project: {notification.projectTitle}
            </p>
          )}
          {notification.commentText && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              "{notification.commentText}"
            </p>
          )}
          {notification.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">
              Reason: {notification.rejectionReason}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-1">
          {!notification.isRead && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 bg-background"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllNotifications}
                className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map(renderNotification)}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Navigate to notifications page if you have one
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
