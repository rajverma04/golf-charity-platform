import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';
import { Ticket, Trophy, Heart, Calendar } from 'lucide-react';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['myDashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data.data;
    }
  });

  if (isLoading) {
    return <div className="text-neutral-500 animate-pulse p-8 font-medium">Booting User Matrix...</div>;
  }

  // Gracefully handle undefined metrics
  const subs = dashboard?.subscription || {};
  const winnings = dashboard?.winningsLedger || [];
  const finance = dashboard?.financials || { totalMoneyWon: 0, pendingMoney: 0 };
  const charity = dashboard?.charity || { name: 'None Selected', percentage: '0' };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
        <p className="text-neutral-400 mt-2">Here is an overview of your Charity Lottery account.</p>
      </div>

      {/* Subscription Alert & Renewal */}
      {subs.status !== 'active' ? (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-yellow-400 font-bold">No Active Subscription</h3>
            <p className="text-yellow-500/80 text-sm mt-1">You must subscribe to participate in draws and view scores.</p>
          </div>
          <a href="/subscription" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors">
            Subscribe Now
          </a>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-green-500/20 text-green-400 rounded-lg"><Calendar size={20}/></div>
             <div>
               <h3 className="text-green-400 font-bold">Active Sub ({subs.plan})</h3>
               <p className="text-green-500/70 text-sm mt-1">Next Stripe billing date: {new Date(subs.end_date).toLocaleDateString()}</p>
             </div>
           </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-start justify-between hover:border-purple-500/50 transition-colors group">
          <div>
            <p className="text-neutral-400 text-sm font-medium">Lifetime Winnings</p>
            <h2 className="text-3xl font-black text-white mt-2 group-hover:text-purple-400 transition-colors">${finance.totalMoneyWon.toFixed(2)}</h2>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Ticket size={24} />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-start justify-between hover:border-blue-500/50 transition-colors group">
          <div>
            <p className="text-neutral-400 text-sm font-medium">Pending Approvals</p>
            <h2 className="text-3xl font-black text-white mt-2 group-hover:text-blue-400 transition-colors">${finance.pendingMoney.toFixed(2)}</h2>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Trophy size={24} />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-start justify-between hover:border-pink-500/50 transition-colors group">
          <div>
            <p className="text-neutral-400 text-sm font-medium">Charity Backed</p>
            <h2 className="text-xl font-bold text-white mt-2 group-hover:text-pink-400 transition-colors line-clamp-1">{charity.name}</h2>
            <p className="text-neutral-500 text-xs mt-1">Directing {charity.percentage}% of funds</p>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
            <Heart size={24} />
          </div>
        </div>
      </div>

       {/* Detailed Financial Ledger */}
       <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl mt-8">
         <h2 className="text-xl font-bold text-white mb-4">Payout Ledger</h2>
         {winnings.length === 0 ? (
           <p className="text-neutral-500 italic">No historical winnings yet. Keep submitting your scores!</p>
         ) : (
           <div className="space-y-3">
             {winnings.map(w => (
               <div key={w.id} className="bg-neutral-950 p-4 rounded-xl flex items-center justify-between border border-neutral-800/50">
                 <div>
                   <p className="text-white font-medium">Match {w.match_type} Win — <span className="text-neutral-400 text-sm text-normal">{new Date(w.draw_date).toLocaleDateString()}</span></p>
                   <p className="text-sm text-neutral-500 mt-1">Prize: <span className="text-green-400 font-bold">${Number(w.prize_amount).toFixed(2)}</span></p>
                 </div>
                 <span className={`px-3 py-1 rounded-md text-xs font-bold ${w.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                   {w.status.toUpperCase()}
                 </span>
               </div>
             ))}
           </div>
         )}
       </div>

    </div>
  );
};

export default DashboardPage;
