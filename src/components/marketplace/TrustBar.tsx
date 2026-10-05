import React from 'react';
import { Shield, CheckCircle, Truck, Phone } from 'lucide-react';

const TrustBar: React.FC = () => {
  const trustItems = [
    {
      icon: Shield,
      title: 'Escrow Protection',
      description: 'Payment held until delivery confirmed',
    },
    {
      icon: CheckCircle,
      title: 'Verified Sellers',
      description: 'All sellers are ID verified',
    },
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      description: 'We deliver to all 47 counties',
    },
    {
      icon: Phone,
      title: 'M-Pesa Payments',
      description: 'Pay securely with M-Pesa',
    },
  ];

  return (
    <section className="bg-amber-pale border-y border-border py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 md:gap-8">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 px-4"
            >
              <item.icon className="w-6 h-6 text-amber flex-shrink-0" />
              <div>
                <p className="font-medium text-dark text-sm">{item.title}</p>
                <p className="text-xs text-muted hidden md:block">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
