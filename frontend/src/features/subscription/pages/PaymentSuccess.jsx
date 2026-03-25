import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-green-500/10 p-6 rounded-full mb-6">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      <h1 className="text-4xl font-black text-white mb-4">Payment Successful!</h1>
      <p className="text-neutral-400 max-w-md mx-auto mb-8">
        Your subscription is now active! Thank you for joining the Charity Lottery. Your first draw awaits.
      </p>
      <Link 
        to="/"
        className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default PaymentSuccess;
