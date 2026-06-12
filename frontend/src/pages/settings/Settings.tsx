import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { Bell, User, Shield, Database, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    department: user?.department || '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    ideaStatusUpdates: true,
    approvalRequests: true,
    systemAlerts: false,
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                disabled
              />
              <Input
                label="Department"
                value={profileData.department}
                onChange={(e) => setProfileData({...profileData, department: e.target.value})}
              />
              <Button variant="primary" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="space-y-4 max-w-2xl">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotificationSettings({...notificationSettings, [key]: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              <Button variant="primary" className="flex items-center gap-2 mt-4">
                <Save className="w-4 h-4" />
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Change Password</h3>
                <div className="space-y-3">
                  <Input label="Current Password" type="password" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm New Password" type="password" />
                  <Button variant="primary">Update Password</Button>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                <p className="text-gray-600 mb-3">Add an extra layer of security to your account</p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Application Version</p>
                <p className="text-lg font-semibold">1.0.0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Database Status</p>
                <p className="text-lg font-semibold text-green-600">Connected</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-lg font-semibold">2 hours ago</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">User Role</p>
                <p className="text-lg font-semibold">{user?.roles?.[0] || 'User'}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;

// Made with Bob
