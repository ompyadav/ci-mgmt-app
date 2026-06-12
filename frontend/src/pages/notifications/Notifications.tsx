import React from 'react';
import { Card } from '../../components/common/Card';
import { Bell, AlertCircle, Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your activities and system alerts</p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Card>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications Center</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Real-time notifications system is currently in development. You'll be able to receive instant updates about your ideas, approvals, comments, and system alerts.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-blue-900 mb-1">Coming Soon</p>
                <p className="text-sm text-blue-800">
                  Full notification system with real-time updates, email notifications, and in-app alerts is being developed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Types */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Idea Status Updates</p>
                  <p className="text-sm text-gray-600">Get notified when your ideas are approved, rejected, or require more information</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Comments & Mentions</p>
                  <p className="text-sm text-gray-600">Receive alerts when someone comments on your ideas or mentions you</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Approval Requests</p>
                  <p className="text-sm text-gray-600">Get notified when ideas are pending your review or approval</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">System Alerts</p>
                  <p className="text-sm text-gray-600">Important system updates, maintenance notices, and announcements</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Features</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Real-time Notifications</p>
                  <p className="text-sm text-gray-600">Instant in-app notifications without page refresh</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Notification Preferences</p>
                  <p className="text-sm text-gray-600">Customize which notifications you want to receive</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Mark as Read/Unread</p>
                  <p className="text-sm text-gray-600">Manage your notification status</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Notification History</p>
                  <p className="text-sm text-gray-600">View all past notifications with filtering</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Browser push notifications for critical updates</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sample Preview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview: How Notifications Will Look</h3>
          <div className="space-y-3">
            {/* Sample Notification 1 */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Idea Approved</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Your idea "Automation for Report Generation" has been approved by the review team
                      </p>
                      <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">New</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Notification 2 */}
            <div className="p-4 rounded-lg border bg-white border-gray-200 opacity-75">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">New Comment</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    John Doe commented on your idea "Process Improvement Initiative"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">1 day ago</p>
                </div>
              </div>
            </div>

            {/* Sample Notification 3 */}
            <div className="p-4 rounded-lg border bg-white border-gray-200 opacity-75">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Approval Required</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    3 new ideas are pending your review and approval
                  </p>
                  <p className="text-xs text-gray-500 mt-2">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Notifications;

// Made with Bob
