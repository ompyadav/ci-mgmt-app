import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Lightbulb,
  Users,
  Bell,
  BarChart3,
  Settings,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Database,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'My Ideas',
      path: '/ideas/my-ideas',
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      name: 'All Ideas',
      path: '/ideas',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: 'Pending Approvals',
      path: '/ideas/pending',
      icon: <Clock className="w-5 h-5" />,
      roles: ['MANAGER', 'ADMIN', 'EXECUTIVE'],
    },
    {
      name: 'Approved Ideas',
      path: '/ideas/approved',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      name: 'Rejected Ideas',
      path: '/ideas/rejected',
      icon: <XCircle className="w-5 h-5" />,
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      name: 'Reports & Analytics',
      path: '/reports-analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['MANAGER', 'ADMIN', 'EXECUTIVE'],
    },
    {
      name: 'Data Management',
      path: '/data-management',
      icon: <Database className="w-5 h-5" />,
      roles: ['ADMIN'],
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['ADMIN'],
    },
  ];

  const hasAccess = (item: NavItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    // Check both with and without ROLE_ prefix
    return user?.roles?.some((role) =>
      item.roles?.includes(role) ||
      item.roles?.includes(role.replace('ROLE_', ''))
    ) || false;
  };

  const filteredNavItems = navItems.filter(hasAccess);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CIMS</h1>
              <p className="text-xs text-gray-500">Continuous Improvement Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-1">
              Need Help?
            </h3>
            <p className="text-xs text-primary-700 mb-3">
              Check our documentation or contact support
            </p>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View Documentation →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Made with Bob

