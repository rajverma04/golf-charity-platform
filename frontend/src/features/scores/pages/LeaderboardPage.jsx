import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeaderboardFn, getMyScoresFn, editScoreFn } from '../api/scores.api';
import SubmitScore from '../components/SubmitScore';
import { Trophy, Clock, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ScoreRow = ({ item }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(item.score);
  const queryClient = useQueryClient();

  const m = useMutation({
    mutationFn: editScoreFn,
    onSuccess: () => {
      toast.success('Score updated');
      queryClient.invalidateQueries({ queryKey: ['myScores'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      setIsEditing(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed')
  });

  if (isEditing) {
    return (
      <tr className="bg-neutral-800/50">
         <td className="px-6 py-4 text-neutral-400">{new Date(item.played_at || item.created_at).toLocaleDateString()}</td>
         <td className="px-6 py-4 flex items-center justify-end gap-2">
            <input 
              type="number" min="1" max="45" value={val} onChange={e=>setVal(Number(e.target.value))}
              className="bg-neutral-950 border border-neutral-700 text-white rounded w-20 px-2 py-1 text-right focus:border-purple-500 outline-none"
            />
            <button onClick={() => m.mutate({ scoreId: item.id, score: val })} className="text-green-400 hover:text-green-300"><Check size={18}/></button>
            <button onClick={() => { setIsEditing(false); setVal(item.score); }} className="text-red-400 hover:text-red-300"><X size={18}/></button>
         </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-neutral-800/50 transition-colors group">
      <td className="px-6 py-4 text-neutral-400 flex items-center gap-3">
        {new Date(item.played_at || item.created_at).toLocaleDateString()}
        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-purple-400 transition-opacity">
          <Edit2 size={14} />
        </button>
      </td>
      <td className="px-6 py-4 text-right font-black text-white">{item.score}</td>
    </tr>
  );
};

const LeaderboardPage = () => {
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboardFn,
  });

  const { data: myScores, isLoading: loadingMyScores } = useQuery({
    queryKey: ['myScores'],
    queryFn: getMyScoresFn,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="text-yellow-500" /> Scores & Leaderboard
        </h1>
        <p className="text-neutral-400 mt-2">Submit your lottery scores and compete globally!</p>
      </div>

      <SubmitScore />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Global Leaderboard */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Global Top 50</h2>
            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">Live</div>
          </div>
          
          <div className="p-0">
            {loadingLeaderboard ? (
              <div className="p-6 text-neutral-400 text-center">Loading leaderboard...</div>
            ) : leaderboard?.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-neutral-950 text-neutral-500 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Rank</th>
                    <th className="px-6 py-3 font-medium">Player</th>
                    <th className="px-6 py-3 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {leaderboard.map((item, index) => (
                    <tr key={index} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`font-bold \${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-neutral-300' : index === 2 ? 'text-amber-600' : 'text-neutral-500'}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                      <td className="px-6 py-4 text-right font-black text-purple-400">{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-neutral-500 text-center">No scores on the leaderboard yet.</div>
            )}
          </div>
        </div>

        {/* My History */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock size={20} /> My Recent Scores</h2>
          </div>
          
          <div className="p-0">
            {loadingMyScores ? (
              <div className="p-6 text-neutral-400 text-center">Loading your history...</div>
            ) : myScores?.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-neutral-950 text-neutral-500 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {myScores.map((item) => (
                    <ScoreRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-neutral-500 text-center">You haven't submitted any scores yet!</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;
