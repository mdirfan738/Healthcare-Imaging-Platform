import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { PermissionKey, hasPermission } from './permissions';

interface CanProps {
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Inline conditional-render helper for hiding/showing buttons, menu items, etc.
// based on the current user's role, without gating an entire route.
const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
  const { user } = useAppSelector((state) => state.auth);
  return hasPermission(user?.role, permission) ? <>{children}</> : <>{fallback}</>;
};

export default Can;
