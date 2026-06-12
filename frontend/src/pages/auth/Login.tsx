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
import { AlertCircle, Lightbulb } from 'lucide-react';

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
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
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

        {/* Login Form */}
        <Card>
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
                  // TODO: Implement forgot password
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
