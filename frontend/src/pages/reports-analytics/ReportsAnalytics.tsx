import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportsAnalytics: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate and view detailed reports on ideas, performance, and metrics',
      icon: BarChart3,
      path: '/reports',
      color: 'blue',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Analyze trends, patterns, and insights from your continuous improvement data',
      icon: TrendingUp,
      path: '/analytics',
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Access reports and analytics tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} onClick={() => navigate(section.path)} className="cursor-pointer">
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-${section.color}-100 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${section.color}-600`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <button
                  onClick={() => navigate(section.path)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Open {section.title}
                  <span>→</span>
                </button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Ideas</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">-</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Implemented</p>
              <p className="text-2xl font-bold text-green-900 mt-1">-</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">-</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Total Savings</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">$-</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;

// Made with Bob