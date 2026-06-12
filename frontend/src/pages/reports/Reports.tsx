import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { ideaService } from '../../api/services/ideaService';
import { dashboardService } from '../../api/services/dashboardService';
import { Idea, IdeaStatus } from '@/types';

type ReportType = 'ideas' | 'roi' | 'performance' | 'users';
type ExportFormat = 'csv' | 'excel' | 'pdf';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('ideas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<IdeaStatus | 'ALL'>('ALL');
  const [category, setCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: ideas, isLoading: ideasLoading } = useQuery({
    queryKey: ['ideas', { status: status !== 'ALL' ? status : undefined }],
    queryFn: () => ideaService.getAllIdeas({ page: 0, size: 1000 }),
  });

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: dashboardService.getKPIs,
  });

  const isLoading = ideasLoading || kpisLoading;

  // Filter ideas based on criteria
  const filteredIdeas = ideas?.content.filter((idea) => {
    const matchesStatus = status === 'ALL' || idea.status === status;
    const matchesSearch = searchTerm === '' || 
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.ideaNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'ALL' || idea.category === category;
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      const ideaDate = new Date(idea.createdAt);
      matchesDate = ideaDate >= new Date(dateFrom) && ideaDate <= new Date(dateTo);
    }

    return matchesStatus && matchesSearch && matchesCategory && matchesDate;
  }) || [];

  // Export functions
  const exportToCSV = () => {
    if (!filteredIdeas.length) return;

    const headers = [
      'Idea Number',
      'Category',
      'Identified by (IBM / Suncor)',
      'Identified On Date',
      'POD / Team',
      'IBM Delivery Manager',
      'Suncor Manager',
      'Suncor GM',
      'Application Name',
      'Name of Consultant',
      'Idea Title',
      'Problem Statement / Opportunity',
      'Proposed Solution',
      'Actual Solution Implemented',
      'Other Supporting PODs / Teams',
      'ServiceNow Ticket #',
      'Expected Quantitative Benefits (Hours)',
      'Expected Quantitative Benefits ($ Value)',
      'Expected Qualitative',
      'Benefit Type (One time / Recurring)',
      'Estimated Efforts (Hours)',
      'Estimated Efforts ($ Value)',
      'Actual Efforts Spent (Hrs)',
      'Actual Efforts Spent ($ Value)',
      'Date of Implementation',
      'Status',
      'Sub Status',
      'Reason for Rejection',
      'Suncor Goals',
      'Remarks'
    ];

    const rows = filteredIdeas.map(idea => [
      idea.ideaNumber || '',
      idea.category || '',
      idea.identifiedBy || '',
      idea.identifiedOn ? new Date(idea.identifiedOn).toLocaleDateString() : '',
      idea.podTeam || '',
      idea.ibmDeliveryManager || '',
      idea.suncorManager || '',
      idea.suncorGm || '',
      idea.applicationName || '',
      idea.consultantName || '',
      idea.title || '',
      idea.problemStatement || '',
      idea.proposedSolution || '',
      idea.actualSolutionImplemented || '',
      idea.supportingPods || '',
      idea.serviceNowTicket || '',
      idea.expectedQuantitativeBenefitsHours || 0,
      idea.expectedQuantitativeBenefitsValue || 0,
      idea.expectedQualitativeBenefits || '',
      idea.benefitType || '',
      idea.estimatedEffortsHours || 0,
      idea.estimatedEffortsValue || 0,
      idea.actualEffortsSpentHours || 0,
      idea.actualEffortsSpentValue || 0,
      idea.implementationDate ? new Date(idea.implementationDate).toLocaleDateString() : '',
      idea.status || '',
      idea.subStatus || '',
      idea.reasonForRejection || '',
      idea.suncorGoals || '',
      idea.remarks || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideas-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    alert('Excel export functionality will be implemented with a library like xlsx or exceljs');
  };

  const exportToPDF = () => {
    alert('PDF export functionality will be implemented with a library like jsPDF');
  };

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
    }
  };

  // Calculate summary statistics
  const summary = {
    totalIdeas: filteredIdeas.length,
    totalROI: filteredIdeas.reduce((sum, idea) => sum + (idea.roi || 0), 0),
    avgROI: filteredIdeas.length > 0 
      ? filteredIdeas.reduce((sum, idea) => sum + (idea.roi || 0), 0) / filteredIdeas.length 
      : 0,
    approvedCount: filteredIdeas.filter(i => i.status === 'APPROVED').length,
    rejectedCount: filteredIdeas.filter(i => i.status === 'REJECTED').length,
    pendingCount: filteredIdeas.filter(i => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length,
  };

  const renderIdeasReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Ideas</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalIdeas}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total ROI</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ${summary.totalROI.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Average ROI</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ${Math.round(summary.avgROI).toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Approval Rate</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {summary.totalIdeas > 0 
                ? ((summary.approvedCount / summary.totalIdeas) * 100).toFixed(1) 
                : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Ideas Table */}
      <Card>
        <div className="p-6">
          <Table
            columns={[
              { key: 'ideaNumber', header: 'Idea #' },
              { key: 'title', header: 'Title' },
              { key: 'category', header: 'Category' },
              {
                key: 'status',
                header: 'Status',
                render: (idea) => <Badge variant={
                  idea.status === 'APPROVED' ? 'success' :
                  idea.status === 'REJECTED' ? 'danger' :
                  idea.status === 'SUBMITTED' ? 'warning' : 'info'
                }>{idea.status}</Badge>
              },
              { key: 'ideaOwnerName', header: 'Owner' },
              {
                key: 'roi',
                header: 'ROI',
                render: (idea) => `$${(idea.roi || 0).toLocaleString()}`
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (idea) => new Date(idea.createdAt).toLocaleDateString()
              },
            ]}
            data={filteredIdeas}
            loading={isLoading}
          />
        </div>
      </Card>
    </div>
  );

  const renderROIReport = () => (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">ROI Analysis Report</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total ROI Generated</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${(kpis?.totalROI || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Average ROI per Idea</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${(kpis?.averageROI || 0).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Top 10 Ideas by ROI</h4>
            <Table
              columns={[
                { key: 'ideaNumber', header: 'Idea #' },
                { key: 'title', header: 'Title' },
                { key: 'category', header: 'Category' },
                {
                  key: 'roi',
                  header: 'ROI',
                  render: (idea) => (
                    <span className="font-semibold text-green-600">
                      ${(idea.roi || 0).toLocaleString()}
                    </span>
                  )
                },
              ]}
              data={[...filteredIdeas]
                .sort((a, b) => (b.roi || 0) - (a.roi || 0))
                .slice(0, 10)}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderPerformanceReport = () => (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-blue-900">Approval Rate</h4>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-blue-900">
              {(kpis?.approvalRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-blue-700 mt-2">
              {summary.approvedCount} of {summary.totalIdeas} ideas approved
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-red-900">Rejection Rate</h4>
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-red-900">
              {(kpis?.rejectionRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-red-700 mt-2">
              {summary.rejectedCount} of {summary.totalIdeas} ideas rejected
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-purple-900">Implementation Rate</h4>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-purple-900">
              {(kpis?.implementationRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-purple-700 mt-2">
              {kpis?.ideasImplemented || 0} ideas implemented
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Status Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{summary.approvedCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{summary.rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderUsersReport = () => (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">User Activity Report</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            User activity reports show idea submission patterns, top contributors, and engagement metrics.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 This report will show detailed user statistics including top idea contributors, 
              submission trends by user, and department-wise analytics.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and export comprehensive reports</p>
      </div>

      {/* Report Type Selection */}
      <Card>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'ideas' as ReportType, label: 'Ideas Report', icon: '💡' },
              { type: 'roi' as ReportType, label: 'ROI Analysis', icon: '💰' },
              { type: 'performance' as ReportType, label: 'Performance', icon: '📊' },
              { type: 'users' as ReportType, label: 'User Activity', icon: '👥' },
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IdeaStatus | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="IMPLEMENTED">Implemented</option>
              </select>
            </div>

            <Input
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Export Buttons */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={filteredIdeas.length === 0}
            >
              📄 Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={filteredIdeas.length === 0}
            >
              📊 Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={filteredIdeas.length === 0}
            >
              📑 Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {reportType === 'ideas' && renderIdeasReport()}
      {reportType === 'roi' && renderROIReport()}
      {reportType === 'performance' && renderPerformanceReport()}
      {reportType === 'users' && renderUsersReport()}
    </div>
  );
};

export default Reports;

// Made with Bob
