import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export const Card = ({ children, className, header, footer }: CardProps) => {
  return (
    <div className={clsx('card', className)}>
      {header && <div className="card-header">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

// Made with Bob
