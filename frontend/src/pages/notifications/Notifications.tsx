import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Bell } from 'lucide-react';

const Notifications: React.FC = () => {
  // Mock notifications - will be replaced with real data
  const notifications = [
    {
      id: 1,
      title: 'New idea submitted',
      message: 'John Doe submitted "Automation for Report Generation"',
      time: '2 hours ago',
      read: false,
      type: 'info',
    },
    {
      id: 2,
      title: 'Idea approved',
      message: 'Your idea "Process Improvement" has been approved',
      time: '5 hours ago',
      read: false,
      type: 'success',
    },
    {
      id: 3,
      title: 'Comment added',
      message: 'Jane Smith commented on your idea',
      time: '1 day ago',
      read: true,
      type: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your activities</p>
        </div>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Mark all as read
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    notification.type === 'success'
                      ? 'bg-green-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <Bell
                    className={`w-5 h-5 ${
                      notification.type === 'success'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="info" className="ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;

// Made with Bob
