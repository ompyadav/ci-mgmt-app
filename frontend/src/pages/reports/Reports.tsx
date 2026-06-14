import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { ideaService } from '../../api/services/ideaService';
import { dashboardService } from '../../api/services/dashboardService';
import { IdeaStatus } from '@/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'ideas' | 'roi' | 'performance' | 'users';
type ExportFormat = 'csv' | 'excel' | 'pdf';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('ideas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<IdeaStatus | 'ALL'>('ALL');
  const [category] = useState('ALL');
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
    if (!filteredIdeas.length) return;

    // Prepare data for Excel
    const excelData = filteredIdeas.map(idea => ({
      'Idea Number': idea.ideaNumber || '',
      'Category': idea.category || '',
      'Identified by (IBM / Suncor)': idea.identifiedBy || '',
      'Identified On Date': idea.identifiedOn ? new Date(idea.identifiedOn).toLocaleDateString() : '',
      'POD / Team': idea.podTeam || '',
      'IBM Delivery Manager': idea.ibmDeliveryManager || '',
      'Suncor Manager': idea.suncorManager || '',
      'Suncor GM': idea.suncorGm || '',
      'Application Name': idea.applicationName || '',
      'Name of Consultant': idea.consultantName || '',
      'Idea Title': idea.title || '',
      'Problem Statement / Opportunity': idea.problemStatement || '',
      'Proposed Solution': idea.proposedSolution || '',
      'Actual Solution Implemented': idea.actualSolutionImplemented || '',
      'Other Supporting PODs / Teams': idea.supportingPods || '',
      'ServiceNow Ticket #': idea.serviceNowTicket || '',
      'Expected Quantitative Benefits (Hours)': idea.expectedQuantitativeBenefitsHours || 0,
      'Expected Quantitative Benefits ($ Value)': idea.expectedQuantitativeBenefitsValue || 0,
      'Expected Qualitative': idea.expectedQualitativeBenefits || '',
      'Benefit Type (One time / Recurring)': idea.benefitType || '',
      'Estimated Efforts (Hours)': idea.estimatedEffortsHours || 0,
      'Estimated Efforts ($ Value)': idea.estimatedEffortsValue || 0,
      'Actual Efforts Spent (Hrs)': idea.actualEffortsSpentHours || 0,
      'Actual Efforts Spent ($ Value)': idea.actualEffortsSpentValue || 0,
      'Date of Implementation': idea.implementationDate ? new Date(idea.implementationDate).toLocaleDateString() : '',
      'Status': idea.status || '',
      'Sub Status': idea.subStatus || '',
      'Reason for Rejection': idea.reasonForRejection || '',
      'Suncor Goals': idea.suncorGoals || '',
      'Remarks': idea.remarks || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Idea Number
      { wch: 20 }, // Category
      { wch: 25 }, // Identified by
      { wch: 18 }, // Identified On Date
      { wch: 20 }, // POD / Team
      { wch: 25 }, // IBM Delivery Manager
      { wch: 25 }, // Suncor Manager
      { wch: 25 }, // Suncor GM
      { wch: 25 }, // Application Name
      { wch: 25 }, // Name of Consultant
      { wch: 40 }, // Idea Title
      { wch: 50 }, // Problem Statement
      { wch: 50 }, // Proposed Solution
      { wch: 50 }, // Actual Solution
      { wch: 30 }, // Supporting PODs
      { wch: 20 }, // ServiceNow Ticket
      { wch: 20 }, // Expected Hours
      { wch: 20 }, // Expected Value
      { wch: 30 }, // Expected Qualitative
      { wch: 25 }, // Benefit Type
      { wch: 20 }, // Estimated Hours
      { wch: 20 }, // Estimated Value
      { wch: 20 }, // Actual Hours
      { wch: 20 }, // Actual Value
      { wch: 20 }, // Implementation Date
      { wch: 15 }, // Status
      { wch: 20 }, // Sub Status
      { wch: 30 }, // Reason for Rejection
      { wch: 30 }, // Suncor Goals
      { wch: 40 }  // Remarks
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Ideas Report');

    // Generate file name with timestamp
    const fileName = `ideas-report-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    if (!filteredIdeas.length) return;

    // Create new PDF document
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Add title
    doc.setFontSize(18);
    doc.text('Ideas Report', 14, 15);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Add summary statistics
    doc.setFontSize(12);
    doc.text('Summary Statistics', 14, 30);
    doc.setFontSize(10);
    doc.text(`Total Ideas: ${summary.totalIdeas}`, 14, 36);
    doc.text(`Approved: ${summary.approvedCount}`, 60, 36);
    doc.text(`Rejected: ${summary.rejectedCount}`, 100, 36);
    doc.text(`Pending: ${summary.pendingCount}`, 140, 36);
    doc.text(`Total ROI: $${summary.totalROI.toLocaleString()}`, 180, 36);

    // Prepare table data
    const tableData = filteredIdeas.map(idea => [
      idea.ideaNumber || '',
      idea.title || '',
      idea.category || '',
      idea.status || '',
      idea.ideaOwnerName || '',
      `$${(idea.roi || 0).toLocaleString()}`,
      new Date(idea.createdAt).toLocaleDateString()
    ]);

    // Add table
    autoTable(doc, {
      startY: 42,
      head: [['Idea #', 'Title', 'Category', 'Status', 'Owner', 'ROI', 'Created']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Idea #
        1: { cellWidth: 60 }, // Title
        2: { cellWidth: 30 }, // Category
        3: { cellWidth: 25 }, // Status
        4: { cellWidth: 35 }, // Owner
        5: { cellWidth: 30 }, // ROI
        6: { cellWidth: 25 }, // Created
      },
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `ideas-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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

  const renderUsersReport = () => {
    // Calculate user-specific metrics from ideas
    const userContributions = filteredIdeas.reduce((acc: any, idea: any) => {
      const owner = idea.ideaOwnerName || 'Unknown';
      if (!acc[owner]) {
        acc[owner] = {
          name: owner,
          totalIdeas: 0,
          approvedIdeas: 0,
          rejectedIdeas: 0,
          pendingIdeas: 0,
          totalROI: 0,
        };
      }
      acc[owner].totalIdeas++;
      if (idea.status === 'APPROVED') acc[owner].approvedIdeas++;
      if (idea.status === 'REJECTED') acc[owner].rejectedIdeas++;
      if (idea.status === 'SUBMITTED' || idea.status === 'UNDER_REVIEW') acc[owner].pendingIdeas++;
      acc[owner].totalROI += idea.roi || 0;
      return acc;
    }, {});

    const topContributors = Object.values(userContributions)
      .sort((a: any, b: any) => b.totalIdeas - a.totalIdeas)
      .slice(0, 10);

    // Calculate submission patterns by month
    const submissionsByMonth = filteredIdeas.reduce((acc: any, idea: any) => {
      const month = new Date(idea.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Engagement metrics
    const engagementMetrics = {
      totalUsers: Object.keys(userContributions).length,
      avgIdeasPerUser: filteredIdeas.length / Math.max(Object.keys(userContributions).length, 1),
      mostActiveUser: topContributors[0]?.name || 'N/A',
      highestROIContributor: Object.values(userContributions)
        .sort((a: any, b: any) => b.totalROI - a.totalROI)[0] as any,
    };

    return (
      <div className="space-y-6">
        {/* Engagement Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Active Contributors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {engagementMetrics.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Users with submissions</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Avg Ideas per User</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {engagementMetrics.avgIdeasPerUser.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Average contribution</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Most Active User</p>
              <p className="text-lg font-bold text-purple-600 mt-1 truncate">
                {engagementMetrics.mostActiveUser}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {topContributors[0]?.totalIdeas || 0} ideas submitted
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Highest ROI Contributor</p>
              <p className="text-lg font-bold text-green-600 mt-1 truncate">
                {engagementMetrics.highestROIContributor?.name || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${(engagementMetrics.highestROIContributor?.totalROI || 0).toLocaleString()} ROI
              </p>
            </div>
          </Card>
        </div>

        {/* Top Contributors Table */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top 10 Contributors</h3>
              <Badge variant="info">{topContributors.length} users</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contributor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Ideas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total ROI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topContributors.map((contributor: any, index: number) => (
                    <tr key={contributor.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-50 text-blue-800'
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contributor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{contributor.totalIdeas}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">{contributor.approvedIdeas}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="danger">{contributor.rejectedIdeas}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="warning">{contributor.pendingIdeas}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          ${contributor.totalROI.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contributor.totalIdeas > 0
                            ? ((contributor.approvedIdeas / contributor.totalIdeas) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Submission Patterns */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Idea Submission Patterns</h3>
            <div className="space-y-3">
              {Object.entries(submissionsByMonth)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .slice(-12)
                .map(([month, count]: [string, any]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(submissionsByMonth) as number[])) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {count} ideas
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

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
