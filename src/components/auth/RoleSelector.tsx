import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Wheat, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';
import { Button, Input } from '@/components/ui';

interface RoleSelectorProps {
  onComplete: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onComplete }) => {
  const { setUserRole, user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [ownerCode, setOwnerCode] = useState('');
  const [showOwnerInput, setShowOwnerInput] = useState(false);

  const roles = [
    {
      id: 'buyer' as UserRole,
      icon: ShoppingCart,
      emoji: '🛒',
      title: 'Buyer',
      description: 'Browse, compare, buy grains and track your orders',
      features: ['Browse marketplace', 'Compare prices', 'Track orders', 'Review sellers'],
      color: 'amber',
    },
    {
      id: 'seller' as UserRole,
      icon: Wheat,
      emoji: '🌾',
      title: 'Seller',
      description: 'List products, manage inventory, and receive payments',
      features: ['All buyer features', 'List products', 'Manage inventory', 'Receive M-Pesa payments'],
      color: 'green',
    },
    {
      id: 'owner' as UserRole,
      icon: Crown,
      emoji: '👑',
      title: 'Owner/Admin',
      description: 'Platform management and analytics dashboard',
      features: ['All seller features', 'Approve sellers', 'View analytics', 'Manage platform'],
      color: 'amber',
      requiresCode: true,
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'owner') {
      setSelectedRole(role);
      setShowOwnerInput(true);
    } else {
      setSelectedRole(role);
      setShowOwnerInput(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    await setUserRole(selectedRole, selectedRole === 'owner' ? ownerCode : undefined);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-dark">
            Welcome to GrainMart, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted mt-2">
            Choose how you'd like to use the platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleRoleSelect(role.id)}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all
                ${selectedRole === role.id 
                  ? 'border-amber bg-amber-pale shadow-lg' 
                  : 'border-border bg-white hover:border-amber/50 hover:shadow-md'
                }
              `}
            >
              {/* Selected indicator */}
              {selectedRole === role.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-amber rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}

              <div className="text-4xl mb-3">{role.emoji}</div>
              <h3 className="font-display font-semibold text-lg text-dark">
                {role.title}
              </h3>
              <p className="text-sm text-muted mt-1 mb-4">
                {role.description}
              </p>
              
              <ul className="space-y-1.5">
                {role.features.map((feature, i) => (
                  <li key={i} className="text-xs text-muted flex items-center gap-2">
                    <span className="text-green">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {role.requiresCode && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-amber font-medium">
                    Requires invite code
                  </span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Owner code input */}
        {showOwnerInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <Input
              label="Owner Invite Code"
              type="password"
              value={ownerCode}
              onChange={(e) => setOwnerCode(e.target.value)}
              placeholder="Enter your invite code"
              hint="Contact GrainMart to get an owner invite code"
            />
          </motion.div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            loading={loading}
            disabled={!selectedRole || (selectedRole === 'owner' && !ownerCode)}
            onClick={handleSubmit}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : '...'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;
