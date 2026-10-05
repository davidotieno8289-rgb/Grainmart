import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { PageLoader } from '@/components/shared';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'seller' && user.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-dark">
            Welcome back, {user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Revenue', value: 'KSh 0', change: '+0%', emoji: '💰' },
            { label: 'Orders', value: '0', change: '0 today', emoji: '📦' },
            { label: 'Listings', value: '0', change: '0 active', emoji: '🌾' },
            { label: 'Rating', value: '0.0', change: '0 reviews', emoji: '⭐' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted text-sm">{stat.label}</span>
                <span className="text-2xl">{stat.emoji}</span>
              </div>
              <p className="font-display text-2xl font-bold text-dark">
                {stat.value}
              </p>
              <p className="text-xs text-muted mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <span className="text-6xl mb-4 block">🌾</span>
          <h2 className="font-display text-xl font-semibold text-dark mb-2">
            Start selling on GrainMart
          </h2>
          <p className="text-muted max-w-md mx-auto mb-6">
            Add your first product listing to start receiving orders from buyers across Kenya.
          </p>
          <button className="px-6 py-3 bg-amber text-white font-medium rounded-lg hover:bg-amber-light transition-colors">
            + Add Your First Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
