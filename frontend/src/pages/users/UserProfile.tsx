import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { User, Mail, Building, MapPin } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-4">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <div className="mt-4 flex justify-center gap-2">
              {user?.roles?.map((role) => (
                <Badge key={role} variant="info">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{user?.department || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-900">{user?.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Stats */}
      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          My Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">12</p>
            <p className="text-sm text-gray-600 mt-1">Ideas Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">$45,000</p>
            <p className="text-sm text-gray-600 mt-1">Total Savings</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;

// Made with Bob
