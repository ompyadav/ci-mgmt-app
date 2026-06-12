import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { Bell, User, Shield, Database, Save, Key, Smartphone, Lock, AlertCircle } from 'lucide-react';

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
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              </div>
              <div className="space-y-3 max-w-2xl">
                <Input label="Current Password" type="password" placeholder="Enter current password" />
                <Input label="New Password" type="password" placeholder="Enter new password (min 8 characters)" />
                <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
                <Button variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </div>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication (2FA)</h2>
              </div>
              <div className="max-w-2xl">
                <p className="text-gray-600 mb-4">
                  Add an extra layer of security to your account by requiring a verification code from your authenticator app.
                </p>
                
                {/* Current Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${user?.mfaEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.mfaEnabled
                            ? 'Your account is protected with two-factor authentication'
                            : 'Enable 2FA to secure your account'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Coming Soon</p>
                      <p className="text-sm text-blue-800">
                        Full 2FA implementation with Google Authenticator, Authy, or Microsoft Authenticator support is currently in development.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Preview */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">What you'll be able to do:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Scan QR code with your authenticator app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Enter 6-digit verification codes during login</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Generate backup codes for account recovery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Manage trusted devices</span>
                    </li>
                  </ul>
                </div>

                <Button variant="outline" disabled className="mt-4">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
            </div>
          </Card>

          {/* Passkey / WebAuthn */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Passkey (Biometric Authentication)</h2>
              </div>
              <div className="max-w-2xl">
                <p className="text-gray-600 mb-4">
                  Use your device's biometric authentication (fingerprint, face recognition) or security key to sign in without a password.
                </p>

                {/* Coming Soon Notice */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 mb-1">Coming Soon</p>
                      <p className="text-sm text-purple-800">
                        Passkey support using WebAuthn standard is currently in development. This will enable passwordless authentication using biometrics or security keys.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Preview */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">What you'll be able to do:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span>Sign in with fingerprint or face recognition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span>Use hardware security keys (YubiKey, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span>Register multiple passkeys for different devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span>Passwordless, phishing-resistant authentication</span>
                    </li>
                  </ul>
                </div>

                {/* Supported Devices Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Supported Devices:</p>
                  <p className="text-sm text-gray-600">
                    Windows Hello, Touch ID (Mac/iOS), Face ID (iOS), Android Biometrics, FIDO2 Security Keys
                  </p>
                </div>

                <Button variant="outline" disabled className="mt-4">
                  <Key className="w-4 h-4 mr-2" />
                  Add Passkey (Coming Soon)
                </Button>
              </div>
            </div>
          </Card>

          {/* Session Management */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
              </div>
              <div className="max-w-2xl">
                <p className="text-gray-600 mb-4">
                  Manage your active sessions and sign out from other devices.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-600">Windows • Chrome • {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Active</span>
                  </div>
                </div>

                <Button variant="outline" className="mt-4" disabled>
                  View All Sessions (Coming Soon)
                </Button>
              </div>
            </div>
          </Card>
        </div>
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
