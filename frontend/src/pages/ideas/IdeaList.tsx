import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { ideaService } from '../../api/services/ideaService';
import { Idea, IdeaStatus, Priority } from '../../types';

const IdeaList: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchIdeas();
  }, [currentPage, statusFilter, priorityFilter, searchTerm]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaService.getAllIdeas({
        page: currentPage,
        size: pageSize,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        search: searchTerm || undefined,
      });
      setIdeas(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchIdeas();
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

  const columns = [
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
      key: 'ideaOwnerName',
      header: 'Owner',
      render: (idea: Idea) => (
        <div>
          <p className="text-sm text-gray-900">{idea.ideaOwnerName}</p>
          <p className="text-xs text-gray-500">{idea.podTeam || '-'}</p>
        </div>
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
      key: 'category',
      header: 'Category',
      render: (idea: Idea) => (
        <span className="text-sm text-gray-700">{idea.category}</span>
      ),
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
          <h1 className="text-3xl font-bold text-gray-900">All Ideas</h1>
          <p className="text-gray-600 mt-2">Browse and manage all continuous improvement ideas</p>
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

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search ideas by title or problem statement..."
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
                  setStatusFilter(e.target.value as IdeaStatus | 'ALL');
                  setCurrentPage(0);
                }}
                className="input w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="MORE_INFO_REQUIRED">More Info Required</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IMPLEMENTED">Implemented</option>
                <option value="BENEFITS_REALIZED">Benefits Realized</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as Priority | 'ALL');
                  setCurrentPage(0);
                }}
                className="input w-full"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
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
                setPriorityFilter('ALL');
                setCurrentPage(0);
              }}
            >
              Clear Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2 ml-auto"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </form>
      </Card>

      {/* Ideas Table */}
      <Card>
        <Table
          data={ideas}
          columns={columns}
          onRowClick={(idea) => navigate(`/ideas/${idea.id}`)}
          loading={loading}
          emptyMessage="No ideas found. Create your first idea to get started!"
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
    </div>
  );
};

export default IdeaList;

// Made with Bob
