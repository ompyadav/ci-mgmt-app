import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  };

  return (
    <span className={clsx('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
};

// Made with Bob
