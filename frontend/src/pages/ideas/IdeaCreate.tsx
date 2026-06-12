import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ArrowLeft, Save } from 'lucide-react';
import { ideaService } from '../../api/services/ideaService';
import { IdeaRequest, Priority, BenefitType } from '../../types';

const IdeaCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<IdeaRequest>({
    category: '',
    title: '',
    problemStatement: '',
    proposedSolution: '',
    priority: 'MEDIUM',
    benefitType: 'ONE_TIME',
  });

  const categories = [
    'Automation',
    'Gen AI',
    'Business Process Improvement',
    'IT Process Improvement',
    'Process Improvement',
    'Reliability',
    'Innovation',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.problemStatement?.trim()) {
      newErrors.problemStatement = 'Problem statement is required';
    } else if (formData.problemStatement.length < 20) {
      newErrors.problemStatement = 'Problem statement must be at least 20 characters';
    }

    if (!formData.proposedSolution?.trim()) {
      newErrors.proposedSolution = 'Proposed solution is required';
    } else if (formData.proposedSolution.length < 20) {
      newErrors.proposedSolution = 'Proposed solution must be at least 20 characters';
    }

    if (formData.expectedQuantitativeBenefitsHours && formData.expectedQuantitativeBenefitsHours < 0) {
      newErrors.expectedQuantitativeBenefitsHours = 'Hours must be positive';
    }

    if (formData.expectedQuantitativeBenefitsValue && formData.expectedQuantitativeBenefitsValue < 0) {
      newErrors.expectedQuantitativeBenefitsValue = 'Value must be positive';
    }

    if (formData.estimatedEffortsHours && formData.estimatedEffortsHours < 0) {
      newErrors.estimatedEffortsHours = 'Hours must be positive';
    }

    if (formData.estimatedEffortsValue && formData.estimatedEffortsValue < 0) {
      newErrors.estimatedEffortsValue = 'Value must be positive';
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
      setLoading(true);
      const idea = await ideaService.create(formData);
      navigate(`/ideas/${idea.id}`);
    } catch (error: any) {
      console.error('Failed to create idea:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create idea' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const idea = await ideaService.create(formData);
      navigate('/ideas/my-ideas');
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save draft' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ideas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Idea</h1>
            <p className="text-gray-600 mt-2">Share your continuous improvement initiative</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Title *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    placeholder="Enter a descriptive title for your idea"
                    helperText="Minimum 10 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`input w-full ${errors.category ? 'input-error' : ''}`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input w-full"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Statement *
                  </label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleChange}
                    rows={4}
                    className={`input w-full ${errors.problemStatement ? 'input-error' : ''}`}
                    placeholder="Describe the problem or opportunity you've identified"
                  />
                  {errors.problemStatement && (
                    <p className="mt-1 text-sm text-red-600">{errors.problemStatement}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Minimum 20 characters</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Solution *
                  </label>
                  <textarea
                    name="proposedSolution"
                    value={formData.proposedSolution}
                    onChange={handleChange}
                    rows={4}
                    className={`input w-full ${errors.proposedSolution ? 'input-error' : ''}`}
                    placeholder="Describe your proposed solution in detail"
                  />
                  {errors.proposedSolution && (
                    <p className="mt-1 text-sm text-red-600">{errors.proposedSolution}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Minimum 20 characters</p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Pod/Team"
                  name="podTeam"
                  value={formData.podTeam || ''}
                  onChange={handleChange}
                  placeholder="Enter your pod or team name"
                />

                <Input
                  label="Application Name"
                  name="applicationName"
                  value={formData.applicationName || ''}
                  onChange={handleChange}
                  placeholder="Enter application name if applicable"
                />

                <Input
                  label="IBM Delivery Manager"
                  name="ibmDeliveryManager"
                  value={formData.ibmDeliveryManager || ''}
                  onChange={handleChange}
                  placeholder="Enter IBM delivery manager name"
                />

                <Input
                  label="Suncor Manager"
                  name="suncorManager"
                  value={formData.suncorManager || ''}
                  onChange={handleChange}
                  placeholder="Enter Suncor manager name"
                />
              </div>
            </div>

            {/* Expected Benefits */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Expected Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benefit Type
                  </label>
                  <select
                    name="benefitType"
                    value={formData.benefitType}
                    onChange={handleChange}
                    className="input w-full"
                  >
                    <option value="ONE_TIME">One Time</option>
                    <option value="RECURRING">Recurring</option>
                  </select>
                </div>

                <Input
                  label="Expected Benefits (Hours)"
                  name="expectedQuantitativeBenefitsHours"
                  type="number"
                  value={formData.expectedQuantitativeBenefitsHours || ''}
                  onChange={handleNumberChange}
                  error={errors.expectedQuantitativeBenefitsHours}
                  placeholder="Enter hours saved"
                  min="0"
                  step="0.1"
                />

                <Input
                  label="Expected Benefits (Value $)"
                  name="expectedQuantitativeBenefitsValue"
                  type="number"
                  value={formData.expectedQuantitativeBenefitsValue || ''}
                  onChange={handleNumberChange}
                  error={errors.expectedQuantitativeBenefitsValue}
                  placeholder="Enter dollar value"
                  min="0"
                  step="0.01"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualitative Benefits
                  </label>
                  <textarea
                    name="expectedQualitativeBenefits"
                    value={formData.expectedQualitativeBenefits || ''}
                    onChange={handleChange}
                    rows={3}
                    className="input w-full"
                    placeholder="Describe non-quantifiable benefits (e.g., improved quality, better user experience)"
                  />
                </div>
              </div>
            </div>

            {/* Estimated Efforts */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estimated Efforts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Estimated Efforts (Hours)"
                  name="estimatedEffortsHours"
                  type="number"
                  value={formData.estimatedEffortsHours || ''}
                  onChange={handleNumberChange}
                  error={errors.estimatedEffortsHours}
                  placeholder="Enter estimated hours"
                  min="0"
                  step="0.1"
                />

                <Input
                  label="Estimated Efforts (Value $)"
                  name="estimatedEffortsValue"
                  type="number"
                  value={formData.estimatedEffortsValue || ''}
                  onChange={handleNumberChange}
                  error={errors.estimatedEffortsValue}
                  placeholder="Enter estimated cost"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suncor Goals
                  </label>
                  <textarea
                    name="suncorGoals"
                    value={formData.suncorGoals || ''}
                    onChange={handleChange}
                    rows={3}
                    className="input w-full"
                    placeholder="How does this align with Suncor's strategic goals?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks || ''}
                    onChange={handleChange}
                    rows={3}
                    className="input w-full"
                    placeholder="Any additional comments or notes"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/ideas')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                Submit Idea
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default IdeaCreate;

// Made with Bob
