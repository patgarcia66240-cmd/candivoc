import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from './ProtectedRoute';

export const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};