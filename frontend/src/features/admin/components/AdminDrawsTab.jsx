import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { PlayCircle, UploadCloud, Settings2 } from 'lucide-react';

const AdminDrawsTab = () => {
  const queryClient = useQueryClient();
  const [drawLogic, setDrawLogic] = useState('algorithm'); // PRD: Configure draw logic (random vs. algorithm)

  const { data: latestDraw, isLoading } = useQuery({
    queryKey: ['adminDrawStatus'],
    queryFn: async () => {
      const { data } = await api.get('/admin/draw/status');
      return data.data;
    }
  });

  const runDrawMut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/admin/draw/run', { type: drawLogic });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['latestDraw'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to run draw')
  });

  const publishMut = useMutation({
    mutationFn: async () => {
      if (!latestDraw?.id) {
        toast.error('No draft draw found to publish. Please run a simulation first.');
        return;
      }
      const { data } = await api.post('/admin/draw/publish', { drawId: latestDraw.id });
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['latestDraw'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish draw')
  });

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white mb-6">Draw Management Engine</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Draw Config Panel */}
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
               <Settings2 size={20} className="text-blue-400" />
             </div>
             <h3 className="text-lg font-bold text-white">Engine Configuration</h3>
          </div>
          
          <div className="space-y-3">
             <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Draw Logic</label>
             <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1">
               <button 
                 onClick={() => setDrawLogic('algorithm')} 
                 className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${drawLogic === 'algorithm' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
               >
                 Algorithm (Skill Match)
               </button>
               <button 
                 onClick={() => setDrawLogic('random')} 
                 className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${drawLogic === 'random' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
               >
                 Random RNG (Lottery)
               </button>
             </div>
             <p className="text-xs text-neutral-500 mt-2">
               {drawLogic === 'algorithm' ? 'Uses the proprietary golf verification matching baseline algorithm.' : 'Bypasses golf scores and assigns verified winners purely via RNG.'}
             </p>
          </div>
        </div>

        {/* Engine Execution Panel */}
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-6">
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">System Controls</h3>
          
          <div className="space-y-4">
             <div className="flex flex-col gap-2">
               <button 
                 onClick={() => { if(window.confirm('Execute the monthly draw simulation now?')) runDrawMut.mutate(); }}
                 disabled={runDrawMut.isPending || (latestDraw?.status === 'published' && new Date(latestDraw?.month).getMonth() === new Date().getMonth())}
                 className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95"
               >
                 <PlayCircle size={20} /> Run Draw Simulation
               </button>
               <p className="text-xs text-neutral-500 text-center">Generates matches based on the current `{drawLogic}` policy.</p>
             </div>

             <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/50">
               <button 
                 onClick={() => { if(window.confirm('Publish results globally to all users? This cannot be undone.')) publishMut.mutate(); }}
                 disabled={publishMut.isPending || latestDraw?.status === 'published'}
                 className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/20 active:scale-95"
               >
                 <UploadCloud size={20} /> Publish Results Live
               </button>
             </div>
          </div>
        </div>
      </div>

      {isLoading ? null : (
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <h3 className="text-neutral-400 font-bold mb-4">Latest Execution State</h3>
          {latestDraw ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                 <p className="text-xs text-neutral-500 uppercase">Draw Month</p>
                 <p className="font-mono text-white mt-1">{new Date(latestDraw.month).toISOString().slice(0, 7)}</p>
               </div>
               <div>
                 <p className="text-xs text-neutral-500 uppercase">Numbers Selected</p>
                 <p className="font-mono text-purple-400 mt-1 font-bold">{latestDraw.numbers.join(', ')}</p>
               </div>
               <div>
                 <p className="text-xs text-neutral-500 uppercase">Logic Engine</p>
                 <p className="font-mono text-white mt-1 capitalize">{latestDraw.type}</p>
               </div>
               <div>
                 <p className="text-xs text-neutral-500 uppercase">Global Status</p>
                 <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded ${latestDraw.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                   {latestDraw.status.toUpperCase()}
                 </span>
               </div>
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No draws have been executed yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDrawsTab;
