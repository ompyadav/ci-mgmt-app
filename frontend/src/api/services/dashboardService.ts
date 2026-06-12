import apiClient from '../client';
import { UserDashboard, ManagerDashboard, ExecutiveDashboard, IdeaStatistics } from '@/types';

export const dashboardService = {
  /**
   * Get user dashboard data
   */
  getUserDashboard: async (): Promise<UserDashboard> => {
    const response = await apiClient.get<UserDashboard>('/dashboard/user');
    return response.data;
  },

  /**
   * Get manager dashboard data
   */
  getManagerDashboard: async (): Promise<ManagerDashboard> => {
    const response = await apiClient.get<ManagerDashboard>('/dashboard/manager');
    return response.data;
  },

  /**
   * Get executive dashboard data
   */
  getExecutiveDashboard: async (): Promise<ExecutiveDashboard> => {
    const response = await apiClient.get<ExecutiveDashboard>('/dashboard/executive');
    return response.data;
  },

  /**
   * Get KPIs
   */
  getKPIs: async (): Promise<Record<string, any>> => {
    const response = await apiClient.get('/dashboard/kpis');
    return response.data;
  },

  /**
   * Get statistics
   */
  getStatistics: async (): Promise<IdeaStatistics> => {
    const response = await apiClient.get<IdeaStatistics>('/dashboard/statistics');
    return response.data;
  },
};

// Made with Bob
