import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  variant?: 'amber' | 'green' | 'terra' | 'dark' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
  animate?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'amber',
  size = 'sm',
  icon,
  children,
  animate = false,
}) => {
  const variants = {
    amber: 'bg-amber-pale text-amber',
    green: 'bg-green-pale text-green',
    terra: 'bg-terra/10 text-terra',
    dark: 'bg-dark text-cream',
    outline: 'bg-transparent border border-border text-muted',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const content = (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {icon}
      {children}
    </span>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Verified badge
export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => (
  <Badge variant="green" size={size} icon={<span>✓</span>}>
    Verified
  </Badge>
);

// Featured badge
export const FeaturedBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => (
  <Badge variant="amber" size={size} icon={<span>⭐</span>}>
    Featured
  </Badge>
);

// Status badges
export const StatusBadge: React.FC<{ 
  status: 'active' | 'pending' | 'delivered' | 'cancelled' | 'preparing' | 'dispatched';
  size?: 'sm' | 'md';
}> = ({ status, size = 'sm' }) => {
  const statusConfig = {
    active: { variant: 'green' as const, label: 'Active' },
    pending: { variant: 'amber' as const, label: 'Pending' },
    delivered: { variant: 'green' as const, label: 'Delivered' },
    cancelled: { variant: 'terra' as const, label: 'Cancelled' },
    preparing: { variant: 'amber' as const, label: 'Preparing' },
    dispatched: { variant: 'green' as const, label: 'Dispatched' },
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export default Badge;
