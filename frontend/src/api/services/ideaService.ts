import apiClient from '../client';
import { Idea, IdeaRequest, IdeaStatistics, PageResponse, IdeaStatus } from '@/types';

export const ideaService = {
  /**
   * Get all ideas with pagination
   */
  getAll: async (page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get idea by ID
   */
  getById: async (id: number): Promise<Idea> => {
    const response = await apiClient.get<Idea>(`/ideas/${id}`);
    return response.data;
  },

  /**
   * Get my ideas (current user)
   */
  getMyIdeas: async (page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas/my-ideas', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Create new idea
   */
  create: async (data: IdeaRequest): Promise<Idea> => {
    const response = await apiClient.post<Idea>('/ideas', data);
    return response.data;
  },

  /**
   * Update idea
   */
  update: async (id: number, data: IdeaRequest): Promise<Idea> => {
    const response = await apiClient.put<Idea>(`/ideas/${id}`, data);
    return response.data;
  },

  /**
   * Delete idea
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/ideas/${id}`);
  },

  /**
   * Submit idea for review
   */
  submit: async (id: number): Promise<Idea> => {
    const response = await apiClient.post<Idea>(`/ideas/${id}/submit`);
    return response.data;
  },

  /**
   * Approve idea
   */
  approve: async (id: number, comments?: string): Promise<Idea> => {
    const response = await apiClient.post<Idea>(`/ideas/${id}/approve`, { comments });
    return response.data;
  },

  /**
   * Reject idea
   */
  reject: async (id: number, reason: string): Promise<Idea> => {
    const response = await apiClient.post<Idea>(`/ideas/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Mark idea as implemented
   */
  markAsImplemented: async (id: number, actualSolutionImplemented: string, comments?: string): Promise<Idea> => {
    const response = await apiClient.post<Idea>(`/ideas/${id}/implement`, {
      actualSolutionImplemented,
      comments
    });
    return response.data;
  },

  /**
   * Revert rejected idea back to draft
   */
  revertToDraft: async (id: number): Promise<Idea> => {
    const response = await apiClient.post<Idea>(`/ideas/${id}/revert-to-draft`);
    return response.data;
  },

  /**
   * Get ideas by status
   */
  getByStatus: async (status: IdeaStatus, page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>(`/ideas/status/${status}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get ideas by category
   */
  getByCategory: async (category: string, page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>(`/ideas/category/${category}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Search ideas
   */
  search: async (searchTerm: string, page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas/search', {
      params: { q: searchTerm, page, size },
    });
    return response.data;
  },

  /**
   * Get all ideas with advanced filtering
   */
  getAllIdeas: async (params: {
    page?: number;
    size?: number;
    status?: IdeaStatus;
    priority?: string;
    search?: string;
  }): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas', {
      params,
    });
    return response.data;
  },

  /**
   * Get ideas by date range
   */
  getByDateRange: async (startDate: string, endDate: string): Promise<Idea[]> => {
    const response = await apiClient.get<Idea[]>('/ideas/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get idea statistics
   */
  getStatistics: async (): Promise<IdeaStatistics> => {
    const response = await apiClient.get<IdeaStatistics>('/ideas/statistics');
    return response.data;
  },

  /**
   * Get pending approvals
   */
  getPendingApprovals: async (page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas/pending-approvals', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get approved ideas
   */
  getApproved: async (page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas/approved', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get rejected ideas
   */
  getRejected: async (page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas/rejected', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get implemented ideas
   */
  getImplemented: async (page = 0, size = 20): Promise<PageResponse<Idea>> => {
    const response = await apiClient.get<PageResponse<Idea>>('/ideas/implemented', {
      params: { page, size },
    });
    return response.data;
  },
};

// Made with Bob
