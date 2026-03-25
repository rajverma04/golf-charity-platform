import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { uploadProofFn } from '../api/winners.api';
import { getLatestDrawFn } from '../../draws/api/draws.api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import { ShieldCheck, UploadCloud } from 'lucide-react';

const WinnersPage = () => {
  const user = useAuthStore((state) => state.user);
  const [fileUrl, setFileUrl] = useState('');

  // Fetch latest draw to see if the user is a winner in it
  const { data: latestDraw, isLoading } = useQuery({
    queryKey: ['latestDraw'],
    queryFn: getLatestDrawFn,
  });

  const mutation = useMutation({
    mutationFn: uploadProofFn,
    onSuccess: () => {
      toast.success('Proof uploaded successfully! Waiting for admin review.');
      setFileUrl('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to upload proof. Ensure you are a winner in this draw.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!latestDraw?.id) {
      toast.error('No active draw found.');
      return;
    }
    mutation.mutate({ drawId: latestDraw.id, fileUrl });
  };

  const isUserWinner = latestDraw?.winners?.some((w) => w.user_id === user?.id) || false;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center gap-3">
          <ShieldCheck className="text-green-500" size={32} /> Winner Verification
        </h1>
        <p className="text-neutral-400">
          Upload proof of identity to claim your lottery winnings. Our team will review your submission and process the payout.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-neutral-500">Loading your draw status...</div>
      ) : !isUserWinner ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <h3 className="text-xl font-bold text-white">No Pending Claims</h3>
          <p className="text-neutral-500 mt-2">You have not won any recent draws that require verification.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-900/20 to-neutral-900 border border-green-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-500/10 rounded-full">
              <UploadCloud size={32} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Submit Identity Proof</h2>
              <p className="text-green-500/80 text-sm">You won in the recent draw! Please provide a secure link to your ID.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Secure Image URL (e.g. Imgur, AWS S3)</label>
              <input 
                type="url" 
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/my-id.jpg"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50"
            >
              {mutation.isPending ? 'Uploading...' : 'Submit Proof'}
            </button>
          </form>
          
          <p className="text-xs text-neutral-500 text-center mt-6">
            By submitting, you agree to our Terms of Service. Verification may take up to 48 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default WinnersPage;
