import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ideaService } from '@/api/services/ideaService';
import { Idea, IdeaRequest, BenefitType, Priority } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

const IdeaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<IdeaRequest>({
    category: '',
    title: '',
    problemStatement: '',
    proposedSolution: '',
    priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Process Improvement',
    'Cost Reduction',
    'Quality Enhancement',
    'Safety Improvement',
    'Technology Innovation',
    'Customer Experience',
    'Sustainability',
    'Other',
  ];

  useEffect(() => {
    fetchIdea();
  }, [id]);

  const fetchIdea = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const idea: Idea = await ideaService.getById(Number(id));
      
      // Convert Idea to IdeaRequest format
      setFormData({
        ideaNumber: idea.ideaNumber,
        category: idea.category,
        identifiedBy: idea.identifiedBy,
        identifiedOn: idea.identifiedOn,
        podTeam: idea.podTeam,
        ibmDeliveryManager: idea.ibmDeliveryManager,
        suncorManager: idea.suncorManager,
        suncorGm: idea.suncorGm,
        applicationName: idea.applicationName,
        consultantName: idea.consultantName,
        title: idea.title,
        problemStatement: idea.problemStatement,
        proposedSolution: idea.proposedSolution,
        actualSolutionImplemented: idea.actualSolutionImplemented,
        supportingPods: idea.supportingPods,
        serviceNowTicket: idea.serviceNowTicket,
        expectedQuantitativeBenefitsHours: idea.expectedQuantitativeBenefitsHours,
        expectedQuantitativeBenefitsValue: idea.expectedQuantitativeBenefitsValue,
        expectedQualitativeBenefits: idea.expectedQualitativeBenefits,
        benefitType: idea.benefitType,
        estimatedEffortsHours: idea.estimatedEffortsHours,
        estimatedEffortsValue: idea.estimatedEffortsValue,
        actualEffortsSpentHours: idea.actualEffortsSpentHours,
        actualEffortsSpentValue: idea.actualEffortsSpentValue,
        implementationDate: idea.implementationDate,
        subStatus: idea.subStatus,
        suncorGoals: idea.suncorGoals,
        remarks: idea.remarks,
        priority: idea.priority,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load idea');
      console.error('Error fetching idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.problemStatement || formData.problemStatement.length < 20) {
      newErrors.problemStatement = 'Problem statement must be at least 20 characters';
    }
    if (!formData.proposedSolution || formData.proposedSolution.length < 20) {
      newErrors.proposedSolution = 'Proposed solution must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await ideaService.update(Number(id), formData);
      alert('Idea updated successfully!');
      navigate(`/ideas/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update idea');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof IdeaRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading idea...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Button onClick={() => navigate('/ideas')}>Back to Ideas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Idea</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={errors.title}
                required
                placeholder="Enter a descriptive title for your idea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || 'MEDIUM'}
                onChange={(e) => handleChange('priority', e.target.value as Priority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <Input
                label="Identified By"
                value={formData.identifiedBy || ''}
                onChange={(e) => handleChange('identifiedBy', e.target.value)}
                placeholder="Person who identified this opportunity"
              />
            </div>

            <div>
              <Input
                label="Identified On"
                type="date"
                value={formData.identifiedOn || ''}
                onChange={(e) => handleChange('identifiedOn', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Problem & Solution */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem & Solution</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => handleChange('problemStatement', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the problem or opportunity in detail..."
                required
              />
              {errors.problemStatement && (
                <p className="mt-1 text-sm text-red-600">{errors.problemStatement}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Minimum 20 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Solution <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.proposedSolution}
                onChange={(e) => handleChange('proposedSolution', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your proposed solution..."
                required
              />
              {errors.proposedSolution && (
                <p className="mt-1 text-sm text-red-600">{errors.proposedSolution}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Minimum 20 characters</p>
            </div>
          </div>
        </Card>

        {/* Additional Details */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Pod/Team"
                value={formData.podTeam || ''}
                onChange={(e) => handleChange('podTeam', e.target.value)}
                placeholder="Your pod or team name"
              />
            </div>

            <div>
              <Input
                label="Application Name"
                value={formData.applicationName || ''}
                onChange={(e) => handleChange('applicationName', e.target.value)}
                placeholder="Related application"
              />
            </div>

            <div>
              <Input
                label="IBM Delivery Manager"
                value={formData.ibmDeliveryManager || ''}
                onChange={(e) => handleChange('ibmDeliveryManager', e.target.value)}
                placeholder="Manager name"
              />
            </div>

            <div>
              <Input
                label="Suncor Manager"
                value={formData.suncorManager || ''}
                onChange={(e) => handleChange('suncorManager', e.target.value)}
                placeholder="Manager name"
              />
            </div>

            <div>
              <Input
                label="Suncor GM"
                value={formData.suncorGm || ''}
                onChange={(e) => handleChange('suncorGm', e.target.value)}
                placeholder="GM name"
              />
            </div>

            <div>
              <Input
                label="Consultant Name"
                value={formData.consultantName || ''}
                onChange={(e) => handleChange('consultantName', e.target.value)}
                placeholder="Consultant involved"
              />
            </div>

            <div>
              <Input
                label="Supporting Pods"
                value={formData.supportingPods || ''}
                onChange={(e) => handleChange('supportingPods', e.target.value)}
                placeholder="Other pods involved"
              />
            </div>

            <div>
              <Input
                label="ServiceNow Ticket"
                value={formData.serviceNowTicket || ''}
                onChange={(e) => handleChange('serviceNowTicket', e.target.value)}
                placeholder="Ticket number"
              />
            </div>
          </div>
        </Card>

        {/* Expected Benefits */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Quantitative Benefits (Hours)"
                type="number"
                value={formData.expectedQuantitativeBenefitsHours || ''}
                onChange={(e) => handleChange('expectedQuantitativeBenefitsHours', parseFloat(e.target.value) || undefined)}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <Input
                label="Quantitative Benefits (Value $)"
                type="number"
                value={formData.expectedQuantitativeBenefitsValue || ''}
                onChange={(e) => handleChange('expectedQuantitativeBenefitsValue', parseFloat(e.target.value) || undefined)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualitative Benefits
              </label>
              <textarea
                value={formData.expectedQualitativeBenefits || ''}
                onChange={(e) => handleChange('expectedQualitativeBenefits', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe non-quantifiable benefits..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefit Type
              </label>
              <select
                value={formData.benefitType || ''}
                onChange={(e) => handleChange('benefitType', e.target.value as BenefitType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="ONE_TIME">One Time</option>
                <option value="RECURRING">Recurring</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Estimated Efforts */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Efforts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Estimated Hours"
                type="number"
                value={formData.estimatedEffortsHours || ''}
                onChange={(e) => handleChange('estimatedEffortsHours', parseFloat(e.target.value) || undefined)}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <Input
                label="Estimated Value ($)"
                type="number"
                value={formData.estimatedEffortsValue || ''}
                onChange={(e) => handleChange('estimatedEffortsValue', parseFloat(e.target.value) || undefined)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </Card>

        {/* Additional Notes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suncor Goals
              </label>
              <textarea
                value={formData.suncorGoals || ''}
                onChange={(e) => handleChange('suncorGoals', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="How does this align with Suncor's goals?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional remarks or notes..."
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/ideas/${id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IdeaEdit;

// Made with Bob
