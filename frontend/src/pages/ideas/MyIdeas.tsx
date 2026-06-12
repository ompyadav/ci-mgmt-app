import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Plus, TrendingUp } from 'lucide-react';
import { ideaService } from '../../api/services/ideaService';
import { Idea, IdeaStatus, Priority } from '../../types';

const MyIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchMyIdeas();
  }, [currentPage]);

  const fetchMyIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaService.getMyIdeas(currentPage, pageSize);
      setIdeas(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch my ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: IdeaStatus) => {
    const statusMap: Record<IdeaStatus, { variant: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
      DRAFT: { variant: 'info', label: 'Draft' },
      SUBMITTED: { variant: 'warning', label: 'Submitted' },
      UNDER_REVIEW: { variant: 'info', label: 'Under Review' },
      MORE_INFO_REQUIRED: { variant: 'warning', label: 'More Info Required' },
      APPROVED: { variant: 'success', label: 'Approved' },
      REJECTED: { variant: 'danger', label: 'Rejected' },
      IN_PROGRESS: { variant: 'info', label: 'In Progress' },
      IMPLEMENTED: { variant: 'success', label: 'Implemented' },
      BENEFITS_REALIZED: { variant: 'success', label: 'Benefits Realized' },
      CLOSED: { variant: 'info', label: 'Closed' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority?: Priority) => {
    if (!priority) return <span className="text-sm text-gray-500">-</span>;
    
    const priorityMap: Record<Priority, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
      LOW: { variant: 'success', label: 'Low' },
      MEDIUM: { variant: 'warning', label: 'Medium' },
      HIGH: { variant: 'danger', label: 'High' },
      CRITICAL: { variant: 'danger', label: 'Critical' },
    };
    const config = priorityMap[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calculate statistics
  const stats = {
    total: ideas.length,
    draft: ideas.filter(i => i.status === 'DRAFT').length,
    submitted: ideas.filter(i => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length,
    approved: ideas.filter(i => i.status === 'APPROVED' || i.status === 'IMPLEMENTED').length,
    rejected: ideas.filter(i => i.status === 'REJECTED').length,
  };

  const columns = [
    {
      key: 'ideaNumber',
      header: 'ID',
      render: (idea: Idea) => (
        <span className="font-mono text-sm text-gray-600">{idea.ideaNumber}</span>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (idea: Idea) => (
        <div>
          <p className="font-medium text-gray-900">{idea.title}</p>
          <p className="text-sm text-gray-500 truncate max-w-md">{idea.problemStatement}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (idea: Idea) => (
        <span className="text-sm text-gray-700">{idea.category}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (idea: Idea) => getStatusBadge(idea.status),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (idea: Idea) => getPriorityBadge(idea.priority),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (idea: Idea) => (
        <span className="text-sm text-gray-600">
          {new Date(idea.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-2">Track and manage your continuous improvement ideas</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/ideas/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Idea
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Ideas</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.draft}</div>
          <div className="text-sm text-gray-600 mt-1">Drafts</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.submitted}</div>
          <div className="text-sm text-gray-600 mt-1">In Review</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600 mt-1">Approved</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600 mt-1">Rejected</div>
        </Card>
      </div>

      {/* Ideas Table */}
      <Card>
        <Table
          data={ideas}
          columns={columns}
          onRowClick={(idea) => navigate(`/ideas/${idea.id}`)}
          loading={loading}
          emptyMessage="You haven't created any ideas yet. Click 'New Idea' to get started!"
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
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Tips for Success</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Provide clear and detailed problem statements</li>
              <li>• Include quantifiable benefits when possible</li>
              <li>• Align your ideas with organizational goals</li>
              <li>• Respond promptly to feedback requests</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyIdeas;

// Made with Bob
