import React from 'react';
import { Card } from '../../components/common/Card';

const UserCreate: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-2">Add a new user to the system</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">User creation form coming soon...</p>
        </div>
      </Card>
    </div>
  );
};

export default UserCreate;

// Made with Bob
