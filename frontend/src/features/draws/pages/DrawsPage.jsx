import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLatestDrawFn, runDrawFn, publishDrawFn } from '../api/draws.api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Ticket, Play, Send } from 'lucide-react';
import { useState } from 'react';

const DrawsPage = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [draftId, setDraftId] = useState(null);

  const { data: latestDraw, isLoading } = useQuery({
    queryKey: ['latestDraw'],
    queryFn: getLatestDrawFn,
  });

  const runMutation = useMutation({
    mutationFn: () => runDrawFn('random'),
    onSuccess: (data) => {
      toast.success('Generated Draft Draw!');
      setDraftId(data.id);
      // Not invalidating latest yet, because it's a draft
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to run draw'),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishDrawFn(draftId),
    onSuccess: () => {
      toast.success('Draw Published Live!');
      setDraftId(null);
      queryClient.invalidateQueries({ queryKey: ['latestDraw'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish draw'),
  });

  // Prepare chart data manually matching our 3, 4, and 5 prize tiers
  let chartData = [
    { name: 'Match 3', count: 0 },
    { name: 'Match 4', count: 0 },
    { name: 'Match 5', count: 0 },
  ];

  if (latestDraw && latestDraw.winners) {
    latestDraw.winners.forEach((w) => {
      if (w.match_type === '3') chartData[0].count += 1;
      if (w.match_type === '4') chartData[1].count += 1;
      if (w.match_type === '5') chartData[2].count += 1;
    });
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket className="text-pink-500" /> Monthly Draw Results
          </h1>
          <p className="text-neutral-400 mt-2">See the winning numbers and prize distributions.</p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex gap-3 bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
            <button 
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending || !!draftId}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Play size={16} className="text-green-400" /> 
              {runMutation.isPending ? 'Running...' : 'Run Draft'}
            </button>
            <button 
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending || !draftId}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> 
              Publish 
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-neutral-500 font-medium">Loading the latest draw data...</div>
      ) : !latestDraw ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <h3 className="text-xl font-bold text-white">No Draws Published Yet</h3>
          <p className="text-neutral-500 mt-2">Check back soon for the next live charity draw!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Winning Numbers */}
          <div className="lg:col-span-3 bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-1/2 translate-x-1/2 rounded-b-xl bg-pink-500/10 px-6 py-2 border-b border-x border-pink-500/20">
              <span className="text-pink-400 font-bold tracking-widest uppercase text-sm">
                Winning Numbers
              </span>
            </div>
            
            <h2 className="text-lg text-neutral-400 mb-8 mt-4 font-medium">
              Draw from {new Date(latestDraw.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4">
              {latestDraw.numbers.map((num, i) => (
                <div key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-lg shadow-pink-500/20 ring-4 ring-neutral-900 border-2 border-white/20">
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Winner Distribution Chart */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Winners Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3'}} />
                  <YAxis stroke="#525252" tick={{fill: '#a3a3a3'}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#262626'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#171717', color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={index === 2 ? '#ec4899' : index === 1 ? '#a855f7' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winner List Overview */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Payout Ledger</h3>
            
            {latestDraw.winners && latestDraw.winners.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-3">
                {latestDraw.winners.map(w => (
                  <div key={w.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white text-sm">{w.name}</p>
                      <p className="text-xs text-neutral-500">Match {w.match_type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${w.status === 'paid' ? 'text-green-400' : 'text-yellow-500'}`}>
                        ${Number(w.prize_amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] uppercase text-neutral-500 tracking-wider mix-blend-screen">{w.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm italic">
                No winners this round!
              </div>
            )}
            
          </div>

        </div>
      )}
    </div>
  );
};

export default DrawsPage;
