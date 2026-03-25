import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingWinnersFn, verifyWinnerFn } from '../api/admin.api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminWinnersTab = () => {
  const queryClient = useQueryClient();

  const { data: winners, isLoading } = useQuery({
    queryKey: ['adminWinners'],
    queryFn: getPendingWinnersFn,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyWinnerFn,
    onSuccess: () => {
      toast.success('Winner status updated!');
      queryClient.invalidateQueries({ queryKey: ['adminWinners'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Verification failed')
  });

  const handleVerify = (winnerId, status) => {
    verifyMutation.mutate({ winnerId, status });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Winners Management</h2>
      {isLoading ? (
        <p className="text-neutral-500">Scanning ledger...</p>
      ) : winners?.length === 0 ? (
        <p className="text-neutral-500 italic">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {winners?.map(w => (
            <div key={w.id} className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                  {w.status.toUpperCase()}
                </span>
                <h3 className="text-xl font-black text-white mt-3">{w.user_name} <span className="text-neutral-500 text-sm font-normal">({w.user_email})</span></h3>
                <p className="text-neutral-400 text-sm mt-1">
                  Draw: {new Date(w.draw_date).toLocaleDateString()} • Pool Tier: Match {w.match_type}
                </p>
                <p className="text-green-400 font-bold mt-2">Cash Payout: ${Number(w.prize_amount).toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col items-end gap-4 min-w-[200px]">
                {w.proof_url ? (
                  <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors flex items-center gap-1">
                    View External Proof <span className="text-xs">&rarr;</span>
                  </a>
                ) : (
                  <span className="text-neutral-600 text-xs italic">No proof uploaded yet</span>
                )}
                
                {w.status === 'pending' && (
                  <div className="flex flex-col gap-2 w-full">
                    <button 
                      onClick={() => handleVerify(w.id, 'paid')}
                      disabled={verifyMutation.isPending}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle size={18}/> Approve Payout
                    </button>
                    <button 
                      onClick={() => handleVerify(w.id, 'rejected')}
                      disabled={verifyMutation.isPending}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <XCircle size={18}/> Reject Issue
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWinnersTab;
