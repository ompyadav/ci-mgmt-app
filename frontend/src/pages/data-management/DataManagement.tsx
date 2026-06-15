import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import apiClient from '../../api/client';
import { Upload, Trash2, Plus, Edit2, FolderTree, List, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MasterItem {
  id?: number;
  name: string;
  description?: string;
}

const DataManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bulk-import');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    successCount: number;
    failureCount: number;
    errors: string[];
  } | null>(null);

  // Master data states
  const [categories, setCategories] = useState<MasterItem[]>([
    { id: 1, name: 'Automation', description: 'Process automation initiatives' },
    { id: 2, name: 'Gen AI', description: 'Generative AI solutions' },
    { id: 3, name: 'Business Process Improvement', description: 'Business process optimization' },
    { id: 4, name: 'IT Process Improvement', description: 'IT process optimization' },
    { id: 5, name: 'Process Improvement', description: 'General process improvements' },
    { id: 6, name: 'Reliability', description: 'System reliability enhancements' },
    { id: 7, name: 'Innovation', description: 'Innovative solutions' },
  ]);

  const [statuses, setStatuses] = useState<MasterItem[]>([
    { id: 1, name: 'Draft', description: 'Idea in draft state' },
    { id: 2, name: 'Under Review', description: 'Idea under review' },
    { id: 3, name: 'Approved', description: 'Idea approved' },
    { id: 4, name: 'Under Development', description: 'Idea being implemented' },
    { id: 5, name: 'On Hold', description: 'Idea on hold' },
    { id: 6, name: 'Rejected', description: 'Idea rejected' },
  ]);

  const [subStatuses, setSubStatuses] = useState<MasterItem[]>([
    { id: 1, name: 'SD', description: 'Service Desk' },
    { id: 2, name: 'PO', description: 'Product Owner' },
    { id: 3, name: 'Business', description: 'Business Team' },
    { id: 4, name: 'CCB', description: 'Change Control Board' },
    { id: 5, name: 'IBM Internal', description: 'IBM Internal Review' },
  ]);

  const [departments, setDepartments] = useState<MasterItem[]>(() => {
    const saved = localStorage.getItem('masterDepartments');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Engineering', description: 'Engineering department' },
      { id: 2, name: 'Product', description: 'Product management' },
      { id: 3, name: 'Design', description: 'Design team' },
      { id: 4, name: 'Marketing', description: 'Marketing department' },
      { id: 5, name: 'Sales', description: 'Sales team' },
      { id: 6, name: 'Operations', description: 'Operations department' },
      { id: 7, name: 'Finance', description: 'Finance department' },
      { id: 8, name: 'Human Resources', description: 'HR department' },
      { id: 9, name: 'Customer Support', description: 'Customer support team' },
      { id: 10, name: 'IT', description: 'IT department' },
      { id: 11, name: 'Quality Assurance', description: 'QA team' },
      { id: 12, name: 'Research & Development', description: 'R&D department' },
    ];
  });

  const [locations, setLocations] = useState<MasterItem[]>(() => {
    const saved = localStorage.getItem('masterLocations');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'New York', description: 'New York office' },
      { id: 2, name: 'San Francisco', description: 'San Francisco office' },
      { id: 3, name: 'London', description: 'London office' },
      { id: 4, name: 'Tokyo', description: 'Tokyo office' },
      { id: 5, name: 'Singapore', description: 'Singapore office' },
      { id: 6, name: 'Mumbai', description: 'Mumbai office' },
      { id: 7, name: 'Toronto', description: 'Toronto office' },
      { id: 8, name: 'Sydney', description: 'Sydney office' },
      { id: 9, name: 'Berlin', description: 'Berlin office' },
      { id: 10, name: 'Remote', description: 'Remote work' },
    ];
  });

  const [editingItem, setEditingItem] = useState<{ type: string; item: MasterItem | null }>({ type: '', item: null });
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  // Save to localStorage whenever departments or locations change
  useEffect(() => {
    localStorage.setItem('masterDepartments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('masterLocations', JSON.stringify(locations));
  }, [locations]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/ideas/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      setFile(null);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || 'Failed to upload file';
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBulkData = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL ideas from the database. This action cannot be undone. Are you sure?')) {
      return;
    }

    if (!window.confirm('This is your final warning. ALL ideas will be permanently deleted. Continue?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiClient.delete('/ideas/bulk-delete');
      alert(`✅ Successfully deleted ${response.data.deletedCount} ideas from the database.`);
      setUploadResult(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete bulk data';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'Idea Number', 'Category', 'Identified by (IBM / Suncor)', 'Identified On Date',
      'POD / Team', 'IBM Delivery Manager', 'Suncor Manager', 'Suncor GM',
      'Application Name', 'Name of Consultant', 'Idea Title', 'Problem Statement / Opportunity',
      'Proposed Solution', 'Actual Solution Implemented', 'Other Supporting PODs / Teams',
      'ServiceNow Ticket #', 'Expected Quantitative Benefits (Hours)', 'Expected Quantitative Benefits ($ Value)',
      'Expected Qualitative', 'Benefit Type (One time / Recurring)', 'Estimated Efforts (Hours)',
      'Estimated Efforts ($ Value)', 'Actual Efforts Spent (Hrs)', 'Actual Efforts Spent ($ Value)',
      'Date of Implementation', 'Status', 'Sub Status', 'Reason for Rejection', 'Suncor Goals', 'Remarks'
    ];

    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ideas-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Master data management functions
  const handleAddItem = (type: string) => {
    if (!newItemName.trim()) {
      alert('Please enter a name');
      return;
    }

    const newItem: MasterItem = {
      id: Date.now(),
      name: newItemName.trim(),
      description: newItemDescription.trim() || undefined,
    };

    if (type === 'category') {
      setCategories([...categories, newItem]);
    } else if (type === 'status') {
      setStatuses([...statuses, newItem]);
    } else if (type === 'substatus') {
      setSubStatuses([...subStatuses, newItem]);
    } else if (type === 'department') {
      setDepartments([...departments, newItem]);
    } else if (type === 'location') {
      setLocations([...locations, newItem]);
    }

    setNewItemName('');
    setNewItemDescription('');
    setEditingItem({ type: '', item: null });
  };

  const handleUpdateItem = (type: string, id: number) => {
    if (!newItemName.trim()) {
      alert('Please enter a name');
      return;
    }

    const updateList = (items: MasterItem[]) =>
      items.map(item =>
        item.id === id
          ? { ...item, name: newItemName.trim(), description: newItemDescription.trim() || undefined }
          : item
      );

    if (type === 'category') {
      setCategories(updateList(categories));
    } else if (type === 'status') {
      setStatuses(updateList(statuses));
    } else if (type === 'substatus') {
      setSubStatuses(updateList(subStatuses));
    } else if (type === 'department') {
      setDepartments(updateList(departments));
    } else if (type === 'location') {
      setLocations(updateList(locations));
    }

    setNewItemName('');
    setNewItemDescription('');
    setEditingItem({ type: '', item: null });
  };

  const handleDeleteItem = (type: string, id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    if (type === 'category') {
      setCategories(categories.filter(item => item.id !== id));
    } else if (type === 'status') {
      setStatuses(statuses.filter(item => item.id !== id));
    } else if (type === 'substatus') {
      setSubStatuses(subStatuses.filter(item => item.id !== id));
    } else if (type === 'department') {
      setDepartments(departments.filter(item => item.id !== id));
    } else if (type === 'location') {
      setLocations(locations.filter(item => item.id !== id));
    }
  };

  const startEdit = (type: string, item: MasterItem) => {
    setEditingItem({ type, item });
    setNewItemName(item.name);
    setNewItemDescription(item.description || '');
  };

  const cancelEdit = () => {
    setEditingItem({ type: '', item: null });
    setNewItemName('');
    setNewItemDescription('');
  };

  const renderMasterList = (type: string, items: MasterItem[], title: string) => (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <Button
            variant="primary"
            onClick={() => setEditingItem({ type, item: null })}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>

        {/* Add/Edit Form */}
        {editingItem.type === type && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">
              {editingItem.item ? 'Edit Item' : 'Add New Item'}
            </h3>
            <div className="space-y-3">
              <Input
                label="Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter name"
              />
              <Input
                label="Description (Optional)"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter description"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    editingItem.item
                      ? handleUpdateItem(type, editingItem.item.id!)
                      : handleAddItem(type)
                  }
                >
                  {editingItem.item ? 'Update' : 'Add'}
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(type, item)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(type, item.id!)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const tabs = [
    { id: 'users', name: 'Users', icon: Users },
    { id: 'bulk-import', name: 'Bulk Import', icon: Upload },
    { id: 'category-master', name: 'Category Master', icon: FolderTree },
    { id: 'status-master', name: 'Status Master', icon: List },
    { id: 'substatus-master', name: 'Sub-Status Master', icon: List },
    { id: 'department-master', name: 'Department Master', icon: Users },
    { id: 'location-master', name: 'Location Master', icon: FolderTree },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-2">Manage bulk imports and master data</p>
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600 mb-6">
              Manage system users, roles, and permissions.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/users')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Go to User Management
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Import Tab */}
      {activeTab === 'bulk-import' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Import Ideas</h2>
            <p className="text-gray-600 mb-6">
              Upload an Excel file (.xlsx or .xls) to import multiple ideas at once.
            </p>

            <div className="space-y-4">
              <div>
                <Button variant="outline" onClick={downloadTemplate} className="mb-4">
                  📥 Download Template
                </Button>
                <p className="text-sm text-gray-500">
                  Download a CSV template with all required columns.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Excel files (.xlsx, .xls) up to 10MB</p>
                  </div>
                  {file && (
                    <div className="mt-4 text-sm text-gray-600">
                      Selected: <span className="font-medium">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {file && (
                <Button variant="primary" onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? 'Uploading...' : '📤 Upload and Import'}
                </Button>
              )}

              {uploadResult && (
                <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-semibold mb-2 ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    Import Results
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-700">✅ Success: {uploadResult.successCount}</p>
                    {uploadResult.failureCount > 0 && <p className="text-red-700">❌ Failed: {uploadResult.failureCount}</p>}
                    {uploadResult.errors?.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold text-red-800 mb-1">Errors:</p>
                        <ul className="list-disc list-inside space-y-1 text-red-700">
                          {uploadResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    Delete all ideas from the database. This action cannot be undone!
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDeleteBulkData}
                    disabled={deleting}
                    className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                  >
                    {deleting ? 'Deleting...' : '🗑️ Delete All Ideas'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category Master Tab */}
      {activeTab === 'category-master' && renderMasterList('category', categories, 'Category Master')}

      {/* Status Master Tab */}
      {activeTab === 'status-master' && renderMasterList('status', statuses, 'Status Master')}

      {/* Sub-Status Master Tab */}
      {activeTab === 'substatus-master' && renderMasterList('substatus', subStatuses, 'Sub-Status Master')}

      {/* Department Master Tab */}
      {activeTab === 'department-master' && renderMasterList('department', departments, 'Department Master')}

      {/* Location Master Tab */}
      {activeTab === 'location-master' && renderMasterList('location', locations, 'Location Master')}
    </div>
  );
};

export default DataManagement;

// Made with Bob