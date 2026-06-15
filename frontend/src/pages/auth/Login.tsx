import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { AlertCircle, Lightbulb, Shield, Key } from 'lucide-react';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [passkeyEmail, setPasskeyEmail] = useState('');
  const [showPasskeyLogin, setShowPasskeyLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Store auth data
      login(response);

      // Redirect to the page user was trying to access, or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.log('Login error:', err);
      console.log('Error response:', err.response);
      
      // Check if 2FA is required (HTTP 403)
      if (err.response?.status === 403) {
        console.log('2FA required detected');
        setRequires2FA(true);
        setCredentials({ email: data.email, password: data.password });
        setError('');
      } else {
        setError(
          err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials || !twoFactorCode) {
      setError('Please enter your 2FA code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await authService.loginWith2FA(
        credentials.email,
        credentials.password,
        twoFactorCode
      );

      // Store auth data
      login(response);

      // Redirect to the page user was trying to access, or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid 2FA code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setCredentials(null);
    setError('');
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

  const handlePasskeyLogin = async () => {
    if (!passkeyEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        setError('Passkeys are not supported in this browser');
        return;
      }

      // Get authentication options from backend
      const optionsResponse = await authService.getPasskeyAuthenticationOptions(passkeyEmail);

      // Convert challenge to Uint8Array
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64UrlToUint8Array(optionsResponse.challenge) as BufferSource,
        timeout: optionsResponse.timeout,
        rpId: optionsResponse.rpId,
        allowCredentials: optionsResponse.allowCredentials.map((cred: any) => ({
          type: cred.type as PublicKeyCredentialType,
          id: base64UrlToUint8Array(cred.id) as BufferSource
        })),
        userVerification: optionsResponse.userVerification as UserVerificationRequirement
      };

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (!credential) {
        setError('Failed to authenticate with passkey');
        return;
      }

      // Prepare assertion data for backend
      const response = credential.response as AuthenticatorAssertionResponse;
      const assertionData = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
          authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
          signature: arrayBufferToBase64Url(response.signature),
          userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : null
        }
      };

      // Verify and login
      console.log('Sending assertion to backend:', assertionData);
      const authResponse = await authService.verifyPasskeyAuthentication(passkeyEmail, assertionData);
      console.log('Authentication successful:', authResponse);

      // Store auth data
      login(authResponse);

      // Redirect to dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Passkey login error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to login with passkey';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasskeyLogin = () => {
    setShowPasskeyLogin(!showPasskeyLogin);
    setError('');
    setPasskeyEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to CIMS
          </h1>
          <p className="text-gray-600">
            Continuous Improvement Management System
          </p>
        </div>

        {/* Login Form, 2FA Form, or Passkey Form */}
        <Card>
          {showPasskeyLogin ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Sign in with Passkey
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Use your device's biometric authentication or security key
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                value={passkeyEmail}
                onChange={(e) => setPasskeyEmail(e.target.value)}
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={togglePasskeyLogin}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isLoading}
                  onClick={handlePasskeyLogin}
                  disabled={!passkeyEmail}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Authenticate
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You must have registered a passkey for this account in Settings before you can use this login method.
                </p>
              </div>
            </div>
          ) : !requires2FA ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password Field */}
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    {...register('rememberMe')}
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => {
                    alert('Forgot password functionality coming soon!');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Passkey Login Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={togglePasskeyLogin}
              >
                <Key className="w-5 h-5 mr-2" />
                Sign in with Passkey
              </Button>

              {/* Demo Credentials */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Demo Credentials:
                </p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>Admin:</strong> admin@example.com / admin123
                  </p>
                  <p>
                    <strong>Manager:</strong> manager@example.com / manager123
                  </p>
                  <p>
                    <strong>User:</strong> user@example.com / user123
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={onSubmit2FA} className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Two-Factor Authentication
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* 2FA Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={6}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app or use a backup code
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isLoading}
                  disabled={twoFactorCode.length !== 6}
                >
                  Verify
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            © 2024 Continuous Improvement Management System. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// Made with Bob
