import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { ideaService } from '../../api/services/ideaService';
import { Idea, Priority } from '../../types';

const ApprovedIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchApprovedIdeas();
  }, [currentPage]);

  const fetchApprovedIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaService.getApproved(currentPage, pageSize);
      setIdeas(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch approved ideas:', error);
    } finally {
      setLoading(false);
    }
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
      key: 'submittedBy',
      header: 'Owner',
      render: (idea: Idea) => (
        <div>
          <p className="text-sm text-gray-900">{idea.ideaOwnerName}</p>
          <p className="text-xs text-gray-500">{idea.podTeam || '-'}</p>
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
      key: 'priority',
      header: 'Priority',
      render: (idea: Idea) => getPriorityBadge(idea.priority),
    },
    {
      key: 'benefits',
      header: 'Expected Benefits',
      render: (idea: Idea) => (
        <div className="text-sm">
          {idea.expectedQuantitativeBenefitsValue ? (
            <p className="text-green-600 font-semibold">
              ${idea.expectedQuantitativeBenefitsValue.toLocaleString()}
            </p>
          ) : idea.expectedQuantitativeBenefitsHours ? (
            <p className="text-blue-600 font-semibold">
              {idea.expectedQuantitativeBenefitsHours}h
            </p>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Approved',
      render: (idea: Idea) => (
        <span className="text-sm text-gray-600">
          {new Date(idea.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approved Ideas</h1>
          <p className="text-gray-600 mt-2">Ideas that have been approved for implementation</p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">{ideas.length} Approved</span>
        </div>
      </div>

      {/* Success Message */}
      {ideas.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Great Progress!</h3>
              <p className="text-sm text-green-800 mt-1">
                These ideas have been approved and are ready for implementation. 
                Track their progress and ensure timely execution.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Ideas Table */}
      <Card>
        <Table
          data={ideas}
          columns={columns}
          onRowClick={(idea) => navigate(`/ideas/${idea.id}`)}
          loading={loading}
          emptyMessage="No approved ideas yet. Keep reviewing submissions!"
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

export default ApprovedIdeas;

// Made with Bob
