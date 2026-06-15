import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/authService';
import { Bell, User, Shield, Database, Save, Key, Smartphone, Lock, AlertCircle, CheckCircle, XCircle, Copy } from 'lucide-react';
import QRCode from 'qrcode';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    department: user?.department || '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      ideaStatusUpdates: true,
      approvalRequests: true,
      systemAlerts: false,
    };
  });

  // 2FA state
  const [twoFactorConfig, setTwoFactorConfig] = useState<any>(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Passkey state
  const [passkeyConfig, setPasskeyConfig] = useState<any>(null);
  const [passkeys, setPasskeys] = useState<any[]>([]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
  ];

  // Load authentication configuration
  useEffect(() => {
    if (activeTab === 'security') {
      loadSecurityConfig();
    }
  }, [activeTab]);

  const loadSecurityConfig = async () => {
    try {
      const [twoFactorData, passkeyData, passkeyList] = await Promise.all([
        authService.get2FAConfig(),
        authService.getPasskeyConfig(),
        authService.listPasskeys().catch(() => [])
      ]);
      setTwoFactorConfig(twoFactorData);
      setPasskeyConfig(passkeyData);
      setPasskeys(passkeyList);
    } catch (err) {
      console.error('Failed to load security config:', err);
    }
  };

  // 2FA Setup
  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      setError('');
      const setupData = await authService.setup2FA();
      setTwoFactorSetupData(setupData);
      setBackupCodes(setupData.backupCodes || []);
      
      // Generate QR code from the URL
      if (setupData.qrCodeUrl) {
        const qrDataUrl = await QRCode.toDataURL(setupData.qrCodeUrl);
        setQrCodeDataUrl(qrDataUrl);
      }
      
      setShow2FASetup(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await authService.verify2FA(verificationCode);
      if (result.success) {
        setSuccess('2FA enabled successfully!');
        setShow2FASetup(false);
        setVerificationCode('');
        loadSecurityConfig();
        // Update user in store
        if (user) {
          updateUser({ ...user, totpEnabled: true });
        }
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }
    
    const code = window.prompt('Enter your 2FA code to confirm:');
    if (!code) return;

    try {
      setLoading(true);
      setError('');
      await authService.disable2FA(code);
      setSuccess('2FA disabled successfully');
      loadSecurityConfig();
      if (user) {
        updateUser({ ...user, totpEnabled: false });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Passkey Management
  const handleAddPasskey = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        setError('Passkeys are not supported in this browser');
        return;
      }

      // Get registration options from backend
      const optionsResponse = await authService.getPasskeyRegistrationOptions();
      
      // Convert challenge and user.id from base64url to Uint8Array
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64UrlToUint8Array(optionsResponse.challenge) as BufferSource,
        rp: optionsResponse.rp,
        user: {
          id: base64UrlToUint8Array(optionsResponse.user.id) as BufferSource,
          name: optionsResponse.user.name,
          displayName: optionsResponse.user.displayName
        },
        pubKeyCredParams: optionsResponse.pubKeyCredParams,
        timeout: optionsResponse.timeout,
        attestation: optionsResponse.attestation as AttestationConveyancePreference,
        authenticatorSelection: optionsResponse.authenticatorSelection
      };
      
      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (!credential) {
        setError('Failed to create passkey');
        return;
      }

      // Prepare credential data for backend
      // Backend expects: { id: string, publicKey: string }
      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Extract the public key from the attestation object
      // For simplified implementation, we'll use the credential ID as a reference
      // In production, you'd parse the attestationObject to extract the actual public key
      const credentialData = {
        id: credential.id,
        publicKey: arrayBufferToBase64Url(response.attestationObject),
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
          attestationObject: arrayBufferToBase64Url(response.attestationObject)
        }
      };

      // Verify and register
      const result = await authService.verifyPasskeyRegistration(credentialData);
      if (result.success) {
        setSuccess('Passkey added successfully!');
        loadSecurityConfig();
        if (user) {
          updateUser({ ...user, passkeyEnabled: true });
        }
      } else {
        setError('Failed to verify passkey');
      }
    } catch (err: any) {
      console.error('Passkey registration error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add passkey');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for WebAuthn
  const base64UrlToUint8Array = (base64url: string): Uint8Array => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const handleRemovePasskey = async (credentialId: string) => {
    if (!window.confirm('Are you sure you want to remove this passkey?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.removePasskey(credentialId);
      setSuccess('Passkey removed successfully');
      loadSecurityConfig();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove passkey');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSaveNotificationPreferences = () => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      setSuccess('Notification preferences saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save notification preferences');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

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
                      checked={value as boolean}
                      onChange={(e) => setNotificationSettings({...notificationSettings, [key]: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              <Button
                variant="primary"
                className="flex items-center gap-2 mt-4"
                onClick={handleSaveNotificationPreferences}
              >
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
                      <div className={`w-3 h-3 rounded-full ${twoFactorConfig?.userEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {twoFactorConfig?.userEnabled ? '2FA Enabled' : '2FA Disabled'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {twoFactorConfig?.userEnabled
                            ? `Your account is protected with two-factor authentication (${twoFactorConfig?.remainingBackupCodes || 0} backup codes remaining)`
                            : 'Enable 2FA to secure your account'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {twoFactorConfig?.enabled ? (
                  twoFactorConfig?.userEnabled ? (
                    <Button variant="outline" onClick={handleDisable2FA} disabled={loading}>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleSetup2FA} disabled={loading}>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  )
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      2FA is currently disabled by system administrator. Contact your admin to enable this feature.
                    </p>
                  </div>
                )}
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

                {/* Current Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${passkeyConfig?.userEnabled ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {passkeyConfig?.userEnabled ? 'Passkey Enabled' : 'Passkey Disabled'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {passkeyConfig?.userEnabled
                            ? `${passkeyConfig?.passkeyCount || 0} passkey(s) registered`
                            : 'No passkeys registered'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registered Passkeys */}
                {passkeys.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h3 className="font-medium text-gray-900">Registered Passkeys:</h3>
                    {passkeys.map((passkey: any) => (
                      <div key={passkey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{passkey.name || 'Passkey'}</p>
                          <p className="text-sm text-gray-600">Added {new Date(passkey.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRemovePasskey(passkey.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {passkeyConfig?.enabled ? (
                  <Button variant="primary" onClick={handleAddPasskey} disabled={loading}>
                    <Key className="w-4 h-4 mr-2" />
                    Add Passkey
                  </Button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Passkey authentication is currently disabled by system administrator. Contact your admin to enable this feature.
                    </p>
                  </div>
                )}
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

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        title="Setup Two-Factor Authentication"
      >
        <div className="space-y-4">
          {twoFactorSetupData && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center mb-4">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">Loading QR Code...</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">Or enter this code manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">{twoFactorSetupData.secret}</code>
                  <button onClick={() => copyToClipboard(twoFactorSetupData.secret)} className="text-blue-600 hover:text-blue-700">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {backupCodes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-900 mb-2">Backup Codes</p>
                  <p className="text-sm text-yellow-800 mb-3">
                    Save these codes in a safe place. You can use them to access your account if you lose your device.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="bg-white px-2 py-1 rounded text-sm">{code}</code>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(backupCodes.join('\n'))}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Codes
                  </Button>
                </div>
              )}

              <div>
                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShow2FASetup(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleVerify2FA} 
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verify & Enable
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

// Made with Bob
