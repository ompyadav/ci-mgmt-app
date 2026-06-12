import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load pages for better performance
const Login = React.lazy(() => import('../pages/auth/Login'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const IdeaList = React.lazy(() => import('../pages/ideas/IdeaList'));
const IdeaCreate = React.lazy(() => import('../pages/ideas/IdeaCreate'));
const IdeaEdit = React.lazy(() => import('../pages/ideas/IdeaEdit'));
const IdeaDetail = React.lazy(() => import('../pages/ideas/IdeaDetail'));
const MyIdeas = React.lazy(() => import('../pages/ideas/MyIdeas'));
const PendingIdeas = React.lazy(() => import('../pages/ideas/PendingIdeas'));
const ApprovedIdeas = React.lazy(() => import('../pages/ideas/ApprovedIdeas'));
const RejectedIdeas = React.lazy(() => import('../pages/ideas/RejectedIdeas'));
const UserList = React.lazy(() => import('../pages/users/UserList'));
const UserCreate = React.lazy(() => import('../pages/users/UserCreate'));
const UserEdit = React.lazy(() => import('../pages/users/UserEdit'));
const UserProfile = React.lazy(() => import('../pages/users/UserProfile'));
const Analytics = React.lazy(() => import('../pages/analytics/Analytics'));
const Reports = React.lazy(() => import('../pages/reports/Reports'));
const ReportsAnalytics = React.lazy(() => import('../pages/reports-analytics/ReportsAnalytics'));
const Notifications = React.lazy(() => import('../pages/notifications/Notifications'));
const DataManagement = React.lazy(() => import('../pages/data-management/DataManagement'));
const Settings = React.lazy(() => import('../pages/settings/Settings'));
const Unauthorized = React.lazy(() => import('../pages/errors/Unauthorized'));
const NotFound = React.lazy(() => import('../pages/errors/NotFound'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'ideas',
        children: [
          {
            index: true,
            element: <IdeaList />,
          },
          {
            path: 'create',
            element: <IdeaCreate />,
          },
          {
            path: 'my-ideas',
            element: <MyIdeas />,
          },
          {
            path: 'pending',
            element: (
              <ProtectedRoute requiredRoles={['MANAGER', 'ADMIN', 'EXECUTIVE']}>
                <PendingIdeas />
              </ProtectedRoute>
            ),
          },
          {
            path: 'approved',
            element: <ApprovedIdeas />,
          },
          {
            path: 'rejected',
            element: <RejectedIdeas />,
          },
          {
            path: ':id/edit',
            element: <IdeaEdit />,
          },
          {
            path: ':id',
            element: <IdeaDetail />,
          },
        ],
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <UserList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/create',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <UserCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/edit/:id',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <UserEdit />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <UserProfile />,
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute requiredRoles={['MANAGER', 'ADMIN', 'EXECUTIVE']}>
            <Analytics />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredRoles={['MANAGER', 'ADMIN', 'EXECUTIVE']}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports-analytics',
        element: (
          <ProtectedRoute requiredRoles={['MANAGER', 'ADMIN', 'EXECUTIVE']}>
            <ReportsAnalytics />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'data-management',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <DataManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// Made with Bob
