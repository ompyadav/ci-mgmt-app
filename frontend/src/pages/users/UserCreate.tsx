import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ArrowLeft, UserPlus } from 'lucide-react';
import apiClient from '../../api/client';
import { UserRequest } from '../../types';

const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<UserRequest>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    businessUnit: '',
    location: '',
    phoneNumber: '',
    roleNames: ['ROLE_USER'],
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Load departments and locations from localStorage
  useEffect(() => {
    const loadMasterData = () => {
      const savedDepartments = localStorage.getItem('masterDepartments');
      const savedLocations = localStorage.getItem('masterLocations');
      
      if (savedDepartments) {
        const deptData = JSON.parse(savedDepartments);
        setDepartments(deptData.map((item: any) => item.name));
      } else {
        // Fallback to default values
        setDepartments([
          'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
          'Operations', 'Finance', 'Human Resources', 'Customer Support',
          'IT', 'Quality Assurance', 'Research & Development'
        ]);
      }
      
      if (savedLocations) {
        const locData = JSON.parse(savedLocations);
        setLocations(locData.map((item: any) => item.name));
      } else {
        // Fallback to default values
        setLocations([
          'New York', 'San Francisco', 'London', 'Tokyo', 'Singapore',
          'Mumbai', 'Toronto', 'Sydney', 'Berlin', 'Remote'
        ]);
      }
    };
    
    loadMasterData();
  }, []);

  const availableRoles = [
    { value: 'ROLE_USER', label: 'User' },
    { value: 'ROLE_REVIEWER', label: 'Reviewer' },
    { value: 'ROLE_APPROVER', label: 'Approver' },
    { value: 'ROLE_ADMIN', label: 'Administrator' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      roleNames: checked
        ? [...prev.roleNames, value]
        : prev.roleNames.filter((role) => role !== value),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId?.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (formData.roleNames.length === 0) {
      newErrors.roles = 'At least one role must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/users', formData);
      navigate('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create user. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-2">Add a new user to the system</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  error={errors.employeeId}
                  required
                  placeholder="e.g., EMP001"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="user@example.com"
                />
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  placeholder="Doe"
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  placeholder="Minimum 8 characters"
                  helperText="Password must be at least 8 characters long"
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Organization Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                <Input
                  label="Business Unit"
                  name="businessUnit"
                  value={formData.businessUnit || ''}
                  onChange={handleChange}
                  placeholder="e.g., North America Operations"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Roles & Permissions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Roles & Permissions <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-3">
                {availableRoles.map((role) => (
                  <label key={role.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={role.value}
                      checked={formData.roleNames.includes(role.value)}
                      onChange={handleRoleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{role.label}</span>
                      <p className="text-xs text-gray-500">
                        {role.value === 'ROLE_USER' && 'Can submit and view own ideas'}
                        {role.value === 'ROLE_REVIEWER' && 'Can review and comment on ideas'}
                        {role.value === 'ROLE_APPROVER' && 'Can approve or reject ideas'}
                        {role.value === 'ROLE_ADMIN' && 'Full system access and user management'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.roles && (
                <p className="mt-2 text-sm text-red-600">{errors.roles}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/users')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default UserCreate;

// Made with Bob
