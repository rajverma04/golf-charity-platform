import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancelled = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-red-500/10 p-6 rounded-full mb-6">
        <XCircle size={64} className="text-red-500" />
      </div>
      <h1 className="text-4xl font-black text-white mb-4">Payment Cancelled</h1>
      <p className="text-neutral-400 max-w-md mx-auto mb-8">
        You cancelled the checkout process. No charges were made.
      </p>
      <Link 
        to="/subscription"
        className="px-8 py-4 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition-colors border border-neutral-700"
      >
        Back to Plans
      </Link>
    </div>
  );
};

export default PaymentCancelled;
