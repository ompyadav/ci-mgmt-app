import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  User as UserIcon, 
  Mail, 
  Building, 
  MapPin, 
  Phone, 
  Calendar,
  Edit,
  ArrowLeft,
  Briefcase,
  Shield
} from 'lucide-react';
import apiClient from '../../api/client';
import { User } from '../../types';

const UserProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ideasSubmitted: 0,
    ideasApproved: 0,
    ideasPending: 0,
    totalSavings: 0,
  });

  // If no ID in URL, show current user's profile
  const isOwnProfile = !id || id === currentUser?.id?.toString();
  const profileUserId = id || currentUser?.id;

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setUser(currentUser);
      setLoading(false);
      fetchUserStats(currentUser.id);
    } else if (profileUserId) {
      fetchUser(Number(profileUserId));
    }
  }, [id, currentUser]);

  const fetchUser = async (userId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get<User>(`/users/${userId}`);
      setUser(response.data);
      fetchUserStats(userId);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: number) => {
    try {
      // Fetch user's idea statistics
      const response = await apiClient.get(`/ideas`, {
        params: {
          userId: userId,
          size: 1000, // Get all ideas for stats
        },
      });

      const ideas = response.data.content || [];
      
      const submitted = ideas.length;
      const approved = ideas.filter((idea: any) => 
        ['APPROVED', 'IMPLEMENTED', 'BENEFITS_REALIZED'].includes(idea.status)
      ).length;
      const pending = ideas.filter((idea: any) => 
        ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED'].includes(idea.status)
      ).length;
      
      // Calculate total savings from approved ideas
      const savings = ideas
        .filter((idea: any) => idea.status === 'BENEFITS_REALIZED')
        .reduce((sum: number, idea: any) => 
          sum + (idea.expectedQuantitativeBenefitsValue || 0), 0
        );

      setStats({
        ideasSubmitted: submitted,
        ideasApproved: approved,
        ideasPending: pending,
        totalSavings: savings,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      ROLE_USER: 'User',
      ROLE_REVIEWER: 'Reviewer',
      ROLE_APPROVER: 'Approver',
      ROLE_ADMIN: 'Administrator',
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'danger', label: 'Inactive' },
      LOCKED: { variant: 'danger', label: 'Locked' },
      PENDING: { variant: 'warning', label: 'Pending' },
    };
    const config = statusMap[status] || { variant: 'info' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Loading profile information...</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">User not found</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600">User not found</p>
            <Button
              variant="outline"
              onClick={() => navigate('/users')}
              className="mt-4"
            >
              Back to Users
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwnProfile ? 'My Profile' : 'User Profile'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isOwnProfile 
              ? 'View and manage your profile information'
              : 'View user profile information'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isOwnProfile && (
            <Button
              variant="outline"
              onClick={() => navigate('/users')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          )}
          {(isOwnProfile || currentUser?.roles?.includes('ROLE_ADMIN')) && (
            <Button
              variant="primary"
              onClick={() => navigate(`/users/${user.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
              <UserIcon className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 mt-1 text-sm">{user.employeeId}</p>
            <p className="text-gray-600 text-sm">{user.email}</p>
            
            <div className="mt-4">
              {getStatusBadge(user.status)}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {user.roles?.map((role) => (
                <Badge key={role} variant="info" className="text-xs">
                  {getRoleLabel(role)}
                </Badge>
              ))}
            </div>

            {user.lastLogin && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(user.lastLogin).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Building className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{user.department || 'N/A'}</p>
              </div>
            </div>

            {user.businessUnit && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Business Unit</p>
                  <p className="font-medium text-gray-900">{user.businessUnit}</p>
                </div>
              </div>
            )}

            {user.location && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{user.location}</p>
                </div>
              </div>
            )}

            {user.phoneNumber && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <div className="mt-1">
                  <p className="text-xs text-gray-600">
                    Email: {user.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                  </p>
                  <p className="text-xs text-gray-600">
                    MFA: {user.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Stats */}
      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {isOwnProfile ? 'My Activity' : 'User Activity'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.ideasSubmitted}</p>
            <p className="text-sm text-gray-600 mt-1">Ideas Submitted</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.ideasApproved}</p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{stats.ideasPending}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              ${stats.totalSavings.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Savings</p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/ideas/my-ideas')}
              className="w-full"
            >
              View My Ideas
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;

// Made with Bob
