import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Plus, Search, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import apiClient from '../../api/client';
import { User, UserStatus } from '../../types';

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Operations',
    'Finance',
    'Human Resources',
    'Customer Support',
    'IT',
    'Quality Assurance',
    'Research & Development',
  ];

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, departmentFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (departmentFilter !== 'ALL') {
        params.department = departmentFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiClient.get<PageResponse<User>>('/users', { params });
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers();
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete user. Please try again.';
      alert(`Error: ${message}`);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: UserStatus) => {
    const endpoint = currentStatus === 'ACTIVE'
      ? `/users/${userId}/deactivate`
      : `/users/${userId}/activate`;
    
    try {
      await apiClient.post(endpoint);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      const message = error.response?.data?.message || 'Failed to update user status. Please try again.';
      alert(message);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const statusMap: Record<UserStatus, { variant: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'danger', label: 'Inactive' },
      LOCKED: { variant: 'danger', label: 'Locked' },
      PENDING: { variant: 'warning', label: 'Pending' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadges = (roles: string[]) => {
    const roleMap: Record<string, string> = {
      ROLE_USER: 'User',
      ROLE_REVIEWER: 'Reviewer',
      ROLE_APPROVER: 'Approver',
      ROLE_ADMIN: 'Admin',
    };

    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <Badge key={role} variant="info" className="text-xs">
            {roleMap[role] || role}
          </Badge>
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (user: User) => (
        <span className="font-medium text-gray-900">{user.employeeId}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div>
          <p className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (user: User) => (
        <div>
          <p className="text-sm text-gray-900">{user.department}</p>
          {user.location && (
            <p className="text-xs text-gray-500">{user.location}</p>
          )}
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user: User) => getRoleBadges(user.roles),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => getStatusBadge(user.status),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (user: User) => (
        <span className="text-sm text-gray-600">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${user.id}/edit`);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title="Edit user"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleUserStatus(user.id, user.status);
            }}
            className={`p-1 rounded ${
              user.status === 'ACTIVE'
                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
            title={user.status === 'ACTIVE' ? 'Lock user (Deactivate)' : 'Unlock user (Activate)'}
          >
            {user.status === 'ACTIVE' ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(user.id);
            }}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage system users and permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/users/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as UserStatus | 'ALL');
                  setCurrentPage(0);
                }}
                className="input w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LOCKED">Locked</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="input w-full"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setDepartmentFilter('ALL');
                setCurrentPage(0);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          data={users}
          columns={columns}
          onRowClick={(user) => navigate(`/users/${user.id}`)}
          loading={loading}
          emptyMessage="No users found. Add your first user to get started!"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserList;

// Made with Bob
