import { useQuery, useMutation } from '@tanstack/react-query';
import { createSubscriptionFn, getSubscriptionStatusFn } from '../api/subscription.api';
import toast from 'react-hot-toast';

const SubscriptionPage = () => {
  const { data: subData, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscriptionStatusFn,
  });

  const mutation = useMutation({
    mutationFn: createSubscriptionFn,
    onSuccess: (data) => {
      // data.checkoutUrl contains the Stripe session URL
      window.location.href = data.checkoutUrl;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to initialize checkout');
    }
  });

  const handleSubscribe = (plan) => {
    mutation.mutate(plan);
  };

  if (isLoading) return <div className="text-white">Loading...</div>;

  const isActive = subData?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4">Choose Your Impact Plan</h1>
        <p className="text-neutral-400">Join the lottery, support charities, and win big.</p>
      </div>

      {isActive && (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-center">
          <h2 className="text-green-400 font-bold text-xl">You have an active subscription! 🎉</h2>
          <p className="text-green-500/80 mt-1">Valid until: {new Date(subData.expiresAt).toLocaleDateString()}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Monthly Plan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col relative hover:border-blue-500/50 transition-colors">
          <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
          <div className="text-4xl font-black text-blue-400 mb-6">$9.99<span className="text-lg text-neutral-500 font-medium">/mo</span></div>
          
          <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
            <li className="flex items-center">✓ 1 Draw Entry per month</li>
            <li className="flex items-center">✓ Support up to 1 Charity</li>
            <li className="flex items-center">✓ Standard Support</li>
          </ul>

          <button 
            onClick={() => handleSubscribe('monthly')}
            disabled={mutation.isPending || isActive}
            className="w-full py-4 rounded-xl font-bold text-white bg-neutral-800 hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Redirecting...' : (isActive ? 'Current Plan' : 'Subscribe Monthly')}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="bg-gradient-to-b from-purple-900/20 to-neutral-900 border border-purple-500/50 rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-purple-900/20">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
            Most Popular
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Yearly (Save 15%)</h3>
          <div className="text-4xl font-black text-purple-400 mb-6">$99.99<span className="text-lg text-neutral-500 font-medium">/yr</span></div>
          
          <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
            <li className="flex items-center font-medium text-white">✓ 15 Draw Entries per month</li>
            <li className="flex items-center">✓ Support unlimited Charities</li>
            <li className="flex items-center">✓ Priority VIP Support</li>
          </ul>

          <button 
            onClick={() => handleSubscribe('yearly')}
            disabled={mutation.isPending || isActive}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {mutation.isPending ? 'Redirecting...' : (isActive ? 'Current Plan' : 'Subscribe Yearly')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPage;
