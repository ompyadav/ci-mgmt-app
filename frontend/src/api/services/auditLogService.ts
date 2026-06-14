import apiClient from '../client';
import { AuditLog, AuditLogFilters, ActivityStatistics, PageResponse } from '../../types';

/**
 * Service for Audit Log and User Activity operations
 */
class AuditLogService {
  /**
   * Get all audit logs with pagination and filtering
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<PageResponse<AuditLog>> {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.action) params.append('action', filters.action);
    if (filters.module) params.append('module', filters.module);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

    const response = await apiClient.get<PageResponse<AuditLog>>(
      `/audit-logs?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(startDate?: string, endDate?: string): Promise<ActivityStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<ActivityStatistics>(
      `/audit-logs/statistics?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  }

  /**
   * Get current user's activity logs
   */
  async getMyActivity(page: number = 0, size: number = 20): Promise<PageResponse<AuditLog>> {
    const response = await apiClient.get<PageResponse<AuditLog>>(
      `/audit-logs/my-activity?page=${page}&size=${size}`
    );
    return response.data;
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.action) params.append('action', filters.action);
    if (filters.module) params.append('module', filters.module);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(
      `/audit-logs/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Helper method to format action type for display
   */
  formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'CREATE': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted',
      'APPROVE': 'Approved',
      'REJECT': 'Rejected',
      'EXPORT': 'Exported',
      'IMPORT': 'Imported',
      'READ': 'Viewed',
      'LOGIN_FAILED': 'Login Failed',
      'PASSWORD_CHANGE': 'Password Changed',
      'PASSWORD_RESET': 'Password Reset',
    };
    return actionMap[action] || action;
  }

  /**
   * Helper method to get action color for badges
   */
  getActionColor(action: string): string {
    const colorMap: Record<string, string> = {
      'LOGIN': 'blue',
      'LOGOUT': 'gray',
      'CREATE': 'green',
      'UPDATE': 'yellow',
      'DELETE': 'red',
      'APPROVE': 'green',
      'REJECT': 'red',
      'EXPORT': 'purple',
      'IMPORT': 'purple',
      'READ': 'blue',
      'LOGIN_FAILED': 'red',
      'PASSWORD_CHANGE': 'orange',
      'PASSWORD_RESET': 'orange',
    };
    return colorMap[action] || 'gray';
  }

  /**
   * Helper method to format module name for display
   */
  formatModule(module: string): string {
    const moduleMap: Record<string, string> = {
      'USER': 'User Management',
      'IDEA': 'Ideas',
      'ROLE': 'Role Management',
      'PERMISSION': 'Permissions',
      'COMMENT': 'Comments',
      'ATTACHMENT': 'Attachments',
      'NOTIFICATION': 'Notifications',
    };
    return moduleMap[module] || module;
  }
}

export default new AuditLogService();

// Made with Bob