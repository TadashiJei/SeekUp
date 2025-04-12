
import React, { useState } from "react";
import { Bell, Check, X, Info, Calendar, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";

// Types for notifications
interface BaseNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface EventNotification extends BaseNotification {
  type: "event";
  eventId: string;
}

interface TaskNotification extends BaseNotification {
  type: "task";
  taskId: string;
}

interface SystemNotification extends BaseNotification {
  type: "system";
}

type Notification = EventNotification | TaskNotification | SystemNotification;

// Sample notifications data
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "event",
    title: "New Event Available",
    message: "Beach Clean-up at Manila Bay is now open for registration.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    eventId: "event123"
  },
  {
    id: "2",
    type: "task",
    title: "Task Assigned",
    message: "You've been assigned as a group leader for Beach Clean-up.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    taskId: "task456"
  },
  {
    id: "3",
    type: "system",
    title: "Welcome to SeekUP",
    message: "Thank you for joining our volunteer platform!",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  }
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "event": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "task": return <Check className="h-4 w-4 text-green-500" />;
      case "system": return <Info className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          {["all", "events", "tasks"].map((tab) => (
            <TabsContent key={tab} value={tab} className="m-0 py-0">
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center p-4 text-gray-500">
                    <Bell className="h-12 w-12 mb-2 text-gray-300" />
                    <p>No notifications to show</p>
                  </div>
                ) : (
                  <div>
                    {notifications
                      .filter(n => tab === "all" || n.type === tab.slice(0, -1))
                      .map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`border-b last:border-0 p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-sm font-semibold mb-1">
                                  {notification.title}
                                  {!notification.read && (
                                    <Badge variant="outline" className="ml-2 bg-blue-100">
                                      New
                                    </Badge>
                                  )}
                                </h4>
                                <div className="flex gap-1">
                                  {!notification.read && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={() => removeNotification(notification.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                              <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
