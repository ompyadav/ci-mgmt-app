import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ideaService } from '../../api/services/ideaService';
import { Idea, Priority } from '../../types';

const PendingIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchPendingIdeas();
  }, [currentPage]);

  const fetchPendingIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaService.getPendingApprovals(currentPage, pageSize);
      setIdeas(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch pending ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedIdea) return;

    try {
      setActionLoading(true);
      await ideaService.approve(selectedIdea.id, comments);
      setShowApproveModal(false);
      setComments('');
      setSelectedIdea(null);
      fetchPendingIdeas();
    } catch (error) {
      console.error('Failed to approve idea:', error);
      alert('Failed to approve idea. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedIdea || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await ideaService.reject(selectedIdea.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedIdea(null);
      fetchPendingIdeas();
    } catch (error) {
      console.error('Failed to reject idea:', error);
      alert('Failed to reject idea. Please try again.');
    } finally {
      setActionLoading(false);
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
      header: 'Submitted By',
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
      key: 'createdAt',
      header: 'Submitted',
      render: (idea: Idea) => (
        <span className="text-sm text-gray-600">
          {new Date(idea.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (idea: Idea) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdea(idea);
              setShowApproveModal(true);
            }}
            className="flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdea(idea);
              setShowRejectModal(true);
            }}
            className="flex items-center gap-1"
          >
            <XCircle className="w-3 h-3" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve continuous improvement ideas</p>
        </div>
        <div className="flex items-center gap-2 text-yellow-600">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">{ideas.length} Pending</span>
        </div>
      </div>

      {/* Alert for pending items */}
      {ideas.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Action Required</h3>
              <p className="text-sm text-yellow-800 mt-1">
                You have {ideas.length} idea{ideas.length !== 1 ? 's' : ''} waiting for your review. 
                Please review and take action to keep the innovation pipeline moving.
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
          emptyMessage="No pending approvals at this time. Great job staying on top of reviews!"
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

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setComments('');
          setSelectedIdea(null);
        }}
        title="Approve Idea"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setComments('');
                setSelectedIdea(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Approve Idea
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Approving Idea</h4>
                <p className="text-sm text-green-800 mt-1">
                  {selectedIdea?.title}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="input w-full"
              placeholder="Add any comments or feedback for the submitter..."
            />
          </div>

          <p className="text-sm text-gray-600">
            The submitter will be notified of the approval and can proceed with implementation.
          </p>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
          setSelectedIdea(null);
        }}
        title="Reject Idea"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedIdea(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              Reject Idea
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Rejecting Idea</h4>
                <p className="text-sm text-red-800 mt-1">
                  {selectedIdea?.title}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="input w-full"
              placeholder="Please provide a clear reason for rejection to help the submitter understand..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              A detailed explanation helps the submitter improve future submissions.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            The submitter will be notified of the rejection along with your feedback.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PendingIdeas;

// Made with Bob
