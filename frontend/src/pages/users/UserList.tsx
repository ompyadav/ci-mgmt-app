import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage system users and permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/users/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">User list coming soon...</p>
        </div>
      </Card>
    </div>
  );
};

export default UserList;

// Made with Bob
