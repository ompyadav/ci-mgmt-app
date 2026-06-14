import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { notificationService } from '../../api/services/notificationService';
import { Notification } from '../../types';
import {
  Bell,
  AlertCircle,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  CheckCheck,
  Loader2,
  XCircle
} from 'lucide-react';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = filter === 'unread'
        ? await notificationService.getUnreadNotifications()
        : await notificationService.getMyNotifications();
      setNotifications(response.content);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      alert(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      alert(err.message || 'Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    try {
      await notificationService.deleteNotification(id);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      alert(err.message || 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'IDEA_APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'IDEA_REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'IDEA_SUBMITTED':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'IDEA_STATUS_CHANGED':
        return <Clock className="w-5 h-5 text-purple-600" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'SYSTEM':
        return <Mail className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'IDEA_APPROVED':
        return 'bg-green-100';
      case 'IDEA_REJECTED':
        return 'bg-red-100';
      case 'IDEA_SUBMITTED':
        return 'bg-blue-100';
      case 'IDEA_STATUS_CHANGED':
        return 'bg-purple-100';
      case 'COMMENT_ADDED':
        return 'bg-blue-100';
      case 'SYSTEM':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchNotifications}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'unread'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      <Card>
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "You don't have any unread notifications"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.notificationType)}`}>
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="info" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;

// Made with Bob
