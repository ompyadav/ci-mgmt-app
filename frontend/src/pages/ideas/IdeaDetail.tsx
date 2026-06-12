import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ideaService } from '@/api/services/ideaService';
import { Idea, IdeaStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImplementModal, setShowImplementModal] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actualSolutionImplemented, setActualSolutionImplemented] = useState('');
  const [implementComments, setImplementComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchIdeaDetails();
  }, [id]);

  const fetchIdeaDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await ideaService.getById(Number(id));
      setIdea(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load idea details');
      console.error('Error fetching idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!idea) return;
    
    try {
      setActionLoading(true);
      await ideaService.approve(idea.id, approveComments);
      setShowApproveModal(false);
      setApproveComments('');
      await fetchIdeaDetails();
      alert('Idea approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve idea');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!idea || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setActionLoading(true);
      await ideaService.reject(idea.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      await fetchIdeaDetails();
      alert('Idea rejected');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject idea');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImplement = async () => {
    if (!idea) return;
    
    if (!actualSolutionImplemented.trim()) {
      alert('Please enter the actual solution implemented');
      return;
    }
    
    try {
      setActionLoading(true);
      await ideaService.markAsImplemented(idea.id, actualSolutionImplemented, implementComments);
      setShowImplementModal(false);
      setActualSolutionImplemented('');
      setImplementComments('');
      await fetchIdeaDetails();
      alert('Idea marked as implemented successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark idea as implemented');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!idea) return;
    
    if (window.confirm('Are you sure you want to submit this idea for review?')) {
      try {
        setLoading(true);
        await ideaService.submit(idea.id);
        await fetchIdeaDetails();
        alert('Idea submitted for review successfully!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to submit idea');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRevertToDraft = async () => {
    if (!idea) return;
    
    if (window.confirm('Are you sure you want to revert this rejected idea back to draft? You can then edit and resubmit it.')) {
      try {
        setLoading(true);
        await ideaService.revertToDraft(idea.id);
        await fetchIdeaDetails();
        alert('Idea reverted to draft successfully! You can now edit and resubmit it.');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to revert idea to draft');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadgeVariant = (status: IdeaStatus) => {
    const variants: Record<IdeaStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      DRAFT: 'info',
      SUBMITTED: 'info',
      UNDER_REVIEW: 'warning',
      MORE_INFO_REQUIRED: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger',
      IN_PROGRESS: 'info',
      IMPLEMENTED: 'success',
      BENEFITS_REALIZED: 'success',
      CLOSED: 'primary',
    };
    return variants[status] || 'primary';
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    if (!priority) return 'primary';
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      LOW: 'primary',
      MEDIUM: 'info',
      HIGH: 'warning',
      CRITICAL: 'danger',
    };
    return variants[priority] || 'primary';
  };

  const canEdit = idea && user && (
    idea.ideaOwnerName === `${user.firstName} ${user.lastName}` &&
    (idea.status === 'DRAFT' || idea.status === 'MORE_INFO_REQUIRED')
  );

  const canSubmit = idea && user && (
    idea.ideaOwnerName === `${user.firstName} ${user.lastName}` &&
    idea.status === 'DRAFT'
  );

  const canApproveReject = idea && user && (
    idea.status === 'SUBMITTED' || idea.status === 'UNDER_REVIEW'
  ) && (
    user.roles.includes('ROLE_MANAGER') ||
    user.roles.includes('ROLE_REVIEWER') ||
    user.roles.includes('ROLE_ADMIN')
  );

  const canMarkImplemented = idea && user && (
    idea.status === 'APPROVED'
  ) && (
    user.roles.includes('ROLE_MANAGER') ||
    user.roles.includes('ROLE_ADMIN')
  );

  const canRevertToDraft = idea && user && (
    idea.status === 'REJECTED' &&
    idea.ideaOwnerName === `${user.firstName} ${user.lastName}`
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading idea details...</div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Idea not found'}
        </div>
        <Button onClick={() => navigate('/ideas')}>Back to Ideas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Idea #{idea.ideaNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(idea.status)}>
            {idea.status.replace(/_/g, ' ')}
          </Badge>
          {idea.priority && (
            <Badge variant={getPriorityBadgeVariant(idea.priority)}>
              {idea.priority}
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/ideas')}>
          Back to List
        </Button>
        {canEdit && (
          <Button onClick={() => navigate(`/ideas/${idea.id}/edit`)}>
            Edit Idea
          </Button>
        )}
        {canSubmit && (
          <Button variant="primary" onClick={handleSubmit}>
            Submit for Review
          </Button>
        )}
        {canApproveReject && (
          <>
            <Button variant="primary" onClick={() => setShowApproveModal(true)}>
              Approve
            </Button>
            <Button variant="danger" onClick={() => setShowRejectModal(true)}>
              Reject
            </Button>
          </>
        )}
        {canMarkImplemented && (
          <Button variant="primary" onClick={() => setShowImplementModal(true)}>
            Mark as Implemented
          </Button>
        )}
        {canRevertToDraft && (
          <Button variant="secondary" onClick={handleRevertToDraft}>
            Revert to Draft
          </Button>
        )}
      </div>

      {/* Rejection Reason Alert */}
      {idea.status === 'REJECTED' && idea.reasonForRejection && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Reason for Rejection</h3>
          <p className="text-sm text-red-700">{idea.reasonForRejection}</p>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <p className="text-gray-900">{idea.category}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Idea Owner</label>
            <p className="text-gray-900">{idea.ideaOwnerName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Identified By</label>
            <p className="text-gray-900">{idea.identifiedBy || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Identified On</label>
            <p className="text-gray-900">
              {idea.identifiedOn ? new Date(idea.identifiedOn).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Pod/Team</label>
            <p className="text-gray-900">{idea.podTeam || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Application</label>
            <p className="text-gray-900">{idea.applicationName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Created At</label>
            <p className="text-gray-900">{new Date(idea.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Last Updated</label>
            <p className="text-gray-900">{new Date(idea.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Problem & Solution */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem & Solution</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Problem Statement</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{idea.problemStatement}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Proposed Solution</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{idea.proposedSolution}</p>
          </div>
          {idea.actualSolutionImplemented && (
            <div>
              <label className="text-sm font-medium text-gray-700">Actual Solution Implemented</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{idea.actualSolutionImplemented}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Expected Benefits */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Quantitative Benefits (Hours)</label>
            <p className="text-gray-900">{idea.expectedQuantitativeBenefitsHours || 0} hours</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Quantitative Benefits (Value)</label>
            <p className="text-gray-900">${idea.expectedQuantitativeBenefitsValue?.toLocaleString() || 0}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Qualitative Benefits</label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">
              {idea.expectedQualitativeBenefits || 'N/A'}
            </p>
          </div>
          {idea.benefitType && (
            <div>
              <label className="text-sm font-medium text-gray-700">Benefit Type</label>
              <p className="text-gray-900">{idea.benefitType.replace(/_/g, ' ')}</p>
            </div>
          )}
          {idea.roi !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-700">ROI</label>
              <p className="text-gray-900">{idea.roi}%</p>
            </div>
          )}
        </div>
      </Card>

      {/* Estimated Efforts */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Efforts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Estimated Hours</label>
            <p className="text-gray-900">{idea.estimatedEffortsHours || 0} hours</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Estimated Value</label>
            <p className="text-gray-900">${idea.estimatedEffortsValue?.toLocaleString() || 0}</p>
          </div>
          {idea.actualEffortsSpentHours !== undefined && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Actual Hours Spent</label>
                <p className="text-gray-900">{idea.actualEffortsSpentHours} hours</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Actual Value Spent</label>
                <p className="text-gray-900">${idea.actualEffortsSpentValue?.toLocaleString() || 0}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Additional Details */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {idea.ibmDeliveryManager && (
            <div>
              <label className="text-sm font-medium text-gray-700">IBM Delivery Manager</label>
              <p className="text-gray-900">{idea.ibmDeliveryManager}</p>
            </div>
          )}
          {idea.suncorManager && (
            <div>
              <label className="text-sm font-medium text-gray-700">Suncor Manager</label>
              <p className="text-gray-900">{idea.suncorManager}</p>
            </div>
          )}
          {idea.suncorGm && (
            <div>
              <label className="text-sm font-medium text-gray-700">Suncor GM</label>
              <p className="text-gray-900">{idea.suncorGm}</p>
            </div>
          )}
          {idea.consultantName && (
            <div>
              <label className="text-sm font-medium text-gray-700">Consultant</label>
              <p className="text-gray-900">{idea.consultantName}</p>
            </div>
          )}
          {idea.supportingPods && (
            <div>
              <label className="text-sm font-medium text-gray-700">Supporting Pods</label>
              <p className="text-gray-900">{idea.supportingPods}</p>
            </div>
          )}
          {idea.serviceNowTicket && (
            <div>
              <label className="text-sm font-medium text-gray-700">ServiceNow Ticket</label>
              <p className="text-gray-900">{idea.serviceNowTicket}</p>
            </div>
          )}
          {idea.implementationDate && (
            <div>
              <label className="text-sm font-medium text-gray-700">Implementation Date</label>
              <p className="text-gray-900">
                {new Date(idea.implementationDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {idea.suncorGoals && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Suncor Goals</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{idea.suncorGoals}</p>
            </div>
          )}
          {idea.remarks && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{idea.remarks}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Idea"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve this idea?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={approveComments}
              onChange={(e) => setApproveComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any comments or feedback..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowApproveModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Idea"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting this idea.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why this idea is being rejected..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark as Implemented Modal */}
      <Modal
        isOpen={showImplementModal}
        onClose={() => setShowImplementModal(false)}
        title="Mark Idea as Implemented"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide details about the actual solution that was implemented.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Solution Implemented <span className="text-red-500">*</span>
            </label>
            <textarea
              value={actualSolutionImplemented}
              onChange={(e) => setActualSolutionImplemented(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the actual solution that was implemented..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={implementComments}
              onChange={(e) => setImplementComments(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional comments about the implementation..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowImplementModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImplement}
              disabled={actionLoading || !actualSolutionImplemented.trim()}
            >
              {actionLoading ? 'Processing...' : 'Mark as Implemented'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IdeaDetail;

// Made with Bob
