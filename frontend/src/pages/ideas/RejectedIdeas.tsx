import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { XCircle, AlertCircle } from 'lucide-react';
import { ideaService } from '../../api/services/ideaService';
import { Idea, Priority } from '../../types';

const RejectedIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchRejectedIdeas();
  }, [currentPage]);

  const fetchRejectedIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaService.getRejected(currentPage, pageSize);
      setIdeas(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch rejected ideas:', error);
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
    return <Badge variant={config.variant}>{config.label}</Badge>
;
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
      key: 'reason',
      header: 'Rejection Reason',
      render: (idea: Idea) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 truncate">
            {idea.reasonForRejection || 'No reason provided'}
          </p>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Rejected',
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
          <h1 className="text-3xl font-bold text-gray-900">Rejected Ideas</h1>
          <p className="text-gray-600 mt-2">Ideas that were not approved for implementation</p>
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="w-5 h-5" />
          <span className="font-semibold">{ideas.length} Rejected</span>
        </div>
      </div>

      {/* Info Message */}
      {ideas.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Learning Opportunity</h3>
              <p className="text-sm text-red-800 mt-1">
                Review rejection reasons to understand decision criteria and improve future submissions. 
                Rejected ideas can be valuable learning experiences.
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
          emptyMessage="No rejected ideas. All submissions have been approved or are pending review!"
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

      {/* Tips for Improvement */}
      <Card className="bg-blue-50 border-blue-200">
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">Tips for Future Submissions</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Ensure clear alignment with organizational goals</li>
            <li>• Provide detailed problem statements and solutions</li>
            <li>• Include quantifiable benefits when possible</li>
            <li>• Consider feasibility and resource requirements</li>
            <li>• Address potential risks and mitigation strategies</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default RejectedIdeas;

// Made with Bob
