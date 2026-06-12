// User Types
export interface User {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  businessUnit?: string;
  location?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  status: UserStatus;
  roles: string[];
  lastLogin?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';

export interface UserRequest {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  department: string;
  businessUnit?: string;
  location?: string;
  phoneNumber?: string;
  roles: string[];
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// Idea Types
export interface Idea {
  id: number;
  ideaNumber: string;
  category: string;
  identifiedBy?: string;
  identifiedOn?: string;
  podTeam?: string;
  ibmDeliveryManager?: string;
  suncorManager?: string;
  suncorGm?: string;
  applicationName?: string;
  consultantName?: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  actualSolutionImplemented?: string;
  supportingPods?: string;
  serviceNowTicket?: string;
  expectedQuantitativeBenefitsHours?: number;
  expectedQuantitativeBenefitsValue?: number;
  expectedQualitativeBenefits?: string;
  benefitType?: BenefitType;
  estimatedEffortsHours?: number;
  estimatedEffortsValue?: number;
  actualEffortsSpentHours?: number;
  actualEffortsSpentValue?: number;
  implementationDate?: string;
  status: IdeaStatus;
  subStatus?: string;
  reasonForRejection?: string;
  suncorGoals?: string;
  remarks?: string;
  priority?: Priority;
  roi?: number;
  ideaOwnerName: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
}

export type IdeaStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'IMPLEMENTED'
  | 'BENEFITS_REALIZED'
  | 'CLOSED';

export type BenefitType = 'ONE_TIME' | 'RECURRING';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IdeaRequest {
  ideaNumber?: string;
  category: string;
  identifiedBy?: string;
  identifiedOn?: string;
  podTeam?: string;
  ibmDeliveryManager?: string;
  suncorManager?: string;
  suncorGm?: string;
  applicationName?: string;
  consultantName?: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  actualSolutionImplemented?: string;
  supportingPods?: string;
  serviceNowTicket?: string;
  expectedQuantitativeBenefitsHours?: number;
  expectedQuantitativeBenefitsValue?: number;
  expectedQualitativeBenefits?: string;
  benefitType?: BenefitType;
  estimatedEffortsHours?: number;
  estimatedEffortsValue?: number;
  actualEffortsSpentHours?: number;
  actualEffortsSpentValue?: number;
  implementationDate?: string;
  subStatus?: string;
  suncorGoals?: string;
  remarks?: string;
  priority?: Priority;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export type NotificationType =
  | 'IDEA_SUBMITTED'
  | 'IDEA_APPROVED'
  | 'IDEA_REJECTED'
  | 'IDEA_STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'SYSTEM';

// Category Types
export interface Category {
  id: number;
  name: string;
  type: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CategoryRequest {
  name: string;
  type: string;
  description?: string;
}

// Dashboard Types
export interface UserDashboard {
  myIdeasCount: number;
  myApprovedIdeas: number;
  myPendingIdeas: number;
  myRejectedIdeas: number;
  unreadNotifications: number;
  recentIdeas: Idea[];
}

export interface ManagerDashboard {
  pendingApprovals: number;
  totalIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
  totalBenefits: number;
  totalROI: number;
  approvalRate: number;
  recentPendingIdeas: Idea[];
}

export interface ExecutiveDashboard {
  organizationSummary: {
    totalIdeas: number;
    approvedIdeas: number;
    rejectedIdeas: number;
    pendingIdeas: number;
    implementedIdeas: number;
  };
  financialMetrics: {
    totalBenefits: number;
    totalROI: number;
    averageROI: number;
  };
  performanceMetrics: {
    approvalRate: number;
    implementationRate: number;
  };
  userStatistics: {
    totalUsers: number;
    activeUsers: number;
  };
  topIdeasByROI: Idea[];
}

export interface IdeaStatistics {
  totalIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
  pendingIdeas: number;
  totalBenefits: number;
  totalROI: number;
}

// Pagination Types
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// API Error Types
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

// Table Types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    size: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

// Filter Types
export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFilters {
  searchTerm?: string;
  status?: IdeaStatus;
  category?: string;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
}

// Role and Permission Types
export type Role = 
  | 'ROLE_ADMIN'
  | 'ROLE_MANAGER'
  | 'ROLE_USER'
  | 'ROLE_EXECUTIVE'
  | 'ROLE_REVIEWER';

export type Permission =
  | 'USER_CREATE'
  | 'USER_READ'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'IDEA_CREATE'
  | 'IDEA_READ'
  | 'IDEA_UPDATE'
  | 'IDEA_DELETE'
  | 'IDEA_APPROVE'
  | 'IDEA_REJECT'
  | 'DASHBOARD_VIEW'
  | 'DASHBOARD_EXECUTIVE'
  | 'REPORT_VIEW'
  | 'REPORT_EXPORT'
  | 'CONFIG_MANAGE'
  | 'ROLE_MANAGE'
  | 'AUDIT_VIEW';

// Made with Bob
