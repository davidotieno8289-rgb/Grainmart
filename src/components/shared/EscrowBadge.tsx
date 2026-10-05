import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface EscrowBadgeProps {
  variant?: 'full' | 'compact' | 'inline';
}

const EscrowBadge: React.FC<EscrowBadgeProps> = ({ variant = 'inline' }) => {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1 text-green text-xs font-medium">
        <Lock className="w-3 h-3" />
        <span>Escrow Protected</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-pale rounded-lg">
        <Shield className="w-4 h-4 text-green" />
        <span className="text-sm font-medium text-green">Escrow Protected</span>
      </div>
    );
  }

  return (
    <div className="bg-green-pale border border-green/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green/10 rounded-lg">
          <Shield className="w-5 h-5 text-green" />
        </div>
        <div>
          <h4 className="font-display font-semibold text-green text-sm">
            🔒 Escrow Protected Payment
          </h4>
          <p className="text-xs text-green/80 mt-1">
            Your payment is held securely and only released to the seller 
            after you confirm delivery. Shop with confidence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EscrowBadge;
