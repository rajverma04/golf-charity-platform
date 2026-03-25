import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCharitiesFn, selectCharityFn } from '../api/charities.api';
import toast from 'react-hot-toast';
import { Heart, ExternalLink, Percent } from 'lucide-react';

const CharitiesPage = () => {
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [percentage, setPercentage] = useState(50);

  const { data: charities, isLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: getCharitiesFn,
  });

  const mutation = useMutation({
    mutationFn: selectCharityFn,
    onSuccess: () => {
      toast.success('Donation preferences updated!');
      setSelectedCharity(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update preferences'),
  });

  const handleAllocate = (charityId) => {
    mutation.mutate({ charityId, percentage });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center gap-3">
          <Heart className="text-pink-500 fill-pink-500" size={32} /> Support a Cause
        </h1>
        <p className="text-neutral-400">
          When you win a draw, a portion of your prize can be automatically donated to the NGO of your choice. Select your preferred charity and set your donation percentage below.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-neutral-500 font-medium">Loading charities...</div>
      ) : charities?.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <h3 className="text-xl font-bold text-white">No Charities Found</h3>
          <p className="text-neutral-500 mt-2">The admin has not added any NGOs to the platform yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities?.map((charity) => (
            <div 
              key={charity.id} 
              className={`bg-neutral-900 border rounded-2xl p-6 transition-all duration-300 \${
                selectedCharity === charity.id 
                  ? 'border-pink-500 ring-4 ring-pink-500/10 shadow-lg shadow-pink-500/5' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white leading-tight">{charity.name}</h2>
                {charity.website_url && (
                  <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-blue-400 transition-colors">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
              
              <p className="text-neutral-400 text-sm mb-6 line-clamp-3">
                {charity.description || "A verified non-profit organization partnered with Charity Lottery."}
              </p>

              {selectedCharity === charity.id ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                    <Percent size={16} className="text-pink-400 ml-2" />
                    <input 
                      type="number" 
                      value={percentage}
                      onChange={(e) => setPercentage(Number(e.target.value))}
                      className="bg-transparent text-white font-bold w-full focus:outline-none p-1"
                      min="10"
                      max="100"
                    />
                    <span className="text-neutral-500 font-medium mr-3">%</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAllocate(charity.id)}
                      disabled={mutation.isPending}
                      className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {mutation.isPending ? 'Saving...' : 'Confirm'}
                    </button>
                    <button 
                      onClick={() => setSelectedCharity(null)}
                      className="px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedCharity(charity.id)}
                  className="w-full py-3 bg-neutral-800 hover:bg-pink-600/20 hover:text-pink-400 text-white font-medium rounded-xl transition-colors border border-transparent hover:border-pink-500/30"
                >
                  Allocate Winnings
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CharitiesPage;
