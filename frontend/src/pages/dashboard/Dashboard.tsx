import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { dashboardService } from '../../api/services/dashboardService';
import { UserDashboard, ManagerDashboard, ExecutiveDashboard, Idea } from '../../types';
import {
  Lightbulb,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [userDashboard, setUserDashboard] = useState<UserDashboard | null>(null);
  const [managerDashboard, setManagerDashboard] = useState<ManagerDashboard | null>(null);
  const [executiveDashboard, setExecutiveDashboard] = useState<ExecutiveDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch appropriate dashboard based on user role
      const roles = user?.roles || [];
      console.log('User roles:', roles);
      console.log('Fetching dashboard data for user:', user);

      if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_EXECUTIVE')) {
        console.log('Fetching executive dashboard...');
        const data = await dashboardService.getExecutiveDashboard();
        console.log('Executive dashboard data:', data);
        setExecutiveDashboard(data);
      } else if (roles.includes('ROLE_MANAGER') || roles.includes('ROLE_REVIEWER')) {
        console.log('Fetching manager dashboard...');
        const data = await dashboardService.getManagerDashboard();
        console.log('Manager dashboard data:', data);
        setManagerDashboard(data);
      } else {
        console.log('Fetching user dashboard...');
        const data = await dashboardService.getUserDashboard();
        console.log('User dashboard data:', data);
        setUserDashboard(data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats based on fetched data
  const getStats = () => {
    if (executiveDashboard) {
      return [
        {
          title: 'Total Ideas',
          value: executiveDashboard.organizationSummary.totalIdeas.toString(),
          change: '+0%',
          icon: <Lightbulb className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          title: 'Approved',
          value: executiveDashboard.organizationSummary.approvedIdeas.toString(),
          change: '+0%',
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'bg-green-500',
        },
        {
          title: 'Pending',
          value: executiveDashboard.organizationSummary.pendingIdeas.toString(),
          change: '+0%',
          icon: <Clock className="w-6 h-6" />,
          color: 'bg-yellow-500',
        },
        {
          title: 'Implemented',
          value: executiveDashboard.organizationSummary.implementedIdeas.toString(),
          change: '+0%',
          icon: <Target className="w-6 h-6" />,
          color: 'bg-purple-500',
        },
      ];
    } else if (managerDashboard) {
      return [
        {
          title: 'Total Ideas',
          value: managerDashboard.totalIdeas.toString(),
          change: '+0%',
          icon: <Lightbulb className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          title: 'Approved',
          value: managerDashboard.approvedIdeas.toString(),
          change: '+0%',
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'bg-green-500',
        },
        {
          title: 'Pending',
          value: managerDashboard.pendingApprovals.toString(),
          change: '+0%',
          icon: <Clock className="w-6 h-6" />,
          color: 'bg-yellow-500',
        },
        {
          title: 'Rejected',
          value: managerDashboard.rejectedIdeas.toString(),
          change: '+0%',
          icon: <XCircle className="w-6 h-6" />,
          color: 'bg-red-500',
        },
      ];
    } else if (userDashboard) {
      return [
        {
          title: 'My Ideas',
          value: userDashboard.myIdeasCount.toString(),
          change: '+0%',
          icon: <Lightbulb className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          title: 'Approved',
          value: userDashboard.myApprovedIdeas.toString(),
          change: '+0%',
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'bg-green-500',
        },
        {
          title: 'Pending',
          value: userDashboard.myPendingIdeas.toString(),
          change: '+0%',
          icon: <Clock className="w-6 h-6" />,
          color: 'bg-yellow-500',
        },
        {
          title: 'Rejected',
          value: userDashboard.myRejectedIdeas.toString(),
          change: '+0%',
          icon: <XCircle className="w-6 h-6" />,
          color: 'bg-red-500',
        },
      ];
    }
    return [];
  };

  const getBenefits = () => {
    if (executiveDashboard) {
      return [
        {
          title: 'Total Benefits',
          value: `$${executiveDashboard.financialMetrics.totalBenefits.toLocaleString()}`,
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          title: 'Total ROI',
          value: `$${executiveDashboard.financialMetrics.totalROI.toLocaleString()}`,
          icon: <TrendingUp className="w-5 h-5" />,
        },
        {
          title: 'Approval Rate',
          value: `${executiveDashboard.performanceMetrics.approvalRate}%`,
          icon: <Target className="w-5 h-5" />,
        },
        {
          title: 'Active Users',
          value: executiveDashboard.userStatistics.activeUsers.toString(),
          icon: <Users className="w-5 h-5" />,
        },
      ];
    } else if (managerDashboard) {
      return [
        {
          title: 'Total Benefits',
          value: `$${managerDashboard.totalBenefits.toLocaleString()}`,
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          title: 'Total ROI',
          value: `$${managerDashboard.totalROI.toLocaleString()}`,
          icon: <TrendingUp className="w-5 h-5" />,
        },
        {
          title: 'Approval Rate',
          value: `${managerDashboard.approvalRate}%`,
          icon: <Target className="w-5 h-5" />,
        },
        {
          title: 'Pending',
          value: managerDashboard.pendingApprovals.toString(),
          icon: <Clock className="w-5 h-5" />,
        },
      ];
    } else if (userDashboard) {
      return [
        {
          title: 'My Ideas',
          value: userDashboard.myIdeasCount.toString(),
          icon: <Lightbulb className="w-5 h-5" />,
        },
        {
          title: 'Approved',
          value: userDashboard.myApprovedIdeas.toString(),
          icon: <CheckCircle className="w-5 h-5" />,
        },
        {
          title: 'Pending',
          value: userDashboard.myPendingIdeas.toString(),
          icon: <Clock className="w-5 h-5" />,
        },
        {
          title: 'Notifications',
          value: userDashboard.unreadNotifications.toString(),
          icon: <Users className="w-5 h-5" />,
        },
      ];
    }
    return [];
  };

  const getRecentIdeas = (): Idea[] => {
    if (executiveDashboard) {
      return executiveDashboard.topIdeasByROI || [];
    } else if (managerDashboard) {
      return managerDashboard.recentPendingIdeas || [];
    } else if (userDashboard) {
      return userDashboard.recentIdeas || [];
    }
    return [];
  };

  const stats = getStats();
  const benefits = getBenefits();
  const recentIdeas = getRecentIdeas();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      Approved: 'success',
      'Under Review': 'info',
      Pending: 'warning',
      Rejected: 'danger',
    };
    return statusMap[status] || 'info';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your continuous improvement initiatives
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Benefits Overview */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Benefits Overview
            </h2>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
                <div className="text-primary-600">{benefit.icon}</div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{benefit.value}</p>
              <p className="text-sm text-gray-600 mt-1">{benefit.title}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Ideas */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Ideas</h2>
            <a
              href="/ideas"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </a>
          </div>
        }
      >
        <div className="space-y-4">
          {recentIdeas.length > 0 ? (
            recentIdeas.map((idea) => (
              <div
                key={idea.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/ideas/${idea.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{idea.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {idea.ideaOwnerName} • {new Date(idea.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getStatusBadge(idea.status)}>{idea.status}</Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No recent ideas</p>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card
        header={
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/ideas/create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Submit New Idea</p>
            <p className="text-sm text-gray-600 mt-1">Share your innovation</p>
          </a>
          <a
            href="/ideas/my-ideas"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">My Ideas</p>
            <p className="text-sm text-gray-600 mt-1">Track your submissions</p>
          </a>
          <a
            href="/reports"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">View Reports</p>
            <p className="text-sm text-gray-600 mt-1">Analyze performance</p>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

// Made with Bob
