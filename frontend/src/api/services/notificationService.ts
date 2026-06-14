import apiClient from '../client';
import { Notification } from '@/types';

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getMyNotifications: async (page = 0, size = 20): Promise<NotificationResponse> => {
    const response = await apiClient.get<NotificationResponse>('/notifications', {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return response.data;
  },

  /**
   * Get unread notifications
   */
  getUnreadNotifications: async (page = 0, size = 20): Promise<NotificationResponse> => {
    const response = await apiClient.get<NotificationResponse>('/notifications/unread', {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Send system notification (admin only)
   */
  sendSystemNotification: async (title: string, message: string): Promise<void> => {
    await apiClient.post('/notifications/system', { title, message });
  },
};

// Made with Bob