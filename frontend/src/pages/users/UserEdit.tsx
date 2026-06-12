import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';

const UserEdit: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit User #{id}</h1>
        <p className="text-gray-600 mt-2">Update user information and permissions</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">User edit form coming soon...</p>
        </div>
      </Card>
    </div>
  );
};

export default UserEdit;

// Made with Bob
