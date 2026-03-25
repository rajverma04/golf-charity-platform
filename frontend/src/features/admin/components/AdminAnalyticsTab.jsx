import { useQuery } from '@tanstack/react-query';
import { getAllUsersFn } from '../api/admin.api';
import api from '../../../lib/axios';
import { Users, DollarSign, HeartHandshake, TrendingUp } from 'lucide-react';

const AdminAnalyticsTab = () => {
  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['adminUsers'], queryFn: getAllUsersFn });
  const { data: latestDraw, isLoading: drawLoading } = useQuery({ queryKey: ['latestDraw'], queryFn: async () => { const { data } = await api.get('/draw/latest'); return data.data; } });

  if (usersLoading || drawLoading) return <div className="text-neutral-500 animate-pulse">Computing telemetry...</div>;

  const totalUsers = users?.length || 0;
  const activeSubs = users?.filter(u => u.sub_status === 'active').length || 0;
  
  // Financial Math (PRD: 90% Pool, 10% Charity, $10 MRR)
  const monthlyRevenue = activeSubs * 10;
  const prizePool = monthlyRevenue * 0.9;
  const charityTotals = monthlyRevenue * 0.1;

  // Draw Stats
  const hasDraw = !!latestDraw;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Reports & System Analytics</h2>
        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           Live Telemetry
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={20} /></div>
            <p className="text-sm font-bold text-neutral-400">Total Users</p>
          </div>
          <p className="text-4xl font-black text-white">{totalUsers}</p>
          <p className="text-sm text-neutral-500 mt-2 font-medium">{activeSubs} Active Subscriptions</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500"><DollarSign size={20} /></div>
            <p className="text-sm font-bold text-neutral-400">Prize Pool (90%)</p>
          </div>
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">${prizePool.toLocaleString()}</p>
          <p className="text-sm text-neutral-500 mt-2 font-medium">Monthly Locked Liquidity</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500"><HeartHandshake size={20} /></div>
            <p className="text-sm font-bold text-neutral-400">Charity Totals (10%)</p>
          </div>
          <p className="text-4xl font-black text-pink-400">${charityTotals.toLocaleString()}</p>
          <p className="text-sm text-neutral-500 mt-2 font-medium">Direct Philanthropic Flow</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><TrendingUp size={20} /></div>
            <p className="text-sm font-bold text-neutral-400">Draw Statistics</p>
          </div>
          <p className="text-4xl font-black text-white">{hasDraw ? 'Ready' : 'Pending'}</p>
          <p className="text-sm text-neutral-500 mt-2 font-medium truncate">Logic: {latestDraw?.type || 'N/A'}</p>
        </div>
      </div>

    </div>
  );
};

export default AdminAnalyticsTab;
