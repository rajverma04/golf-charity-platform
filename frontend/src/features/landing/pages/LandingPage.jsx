import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Trophy, CreditCard, ArrowRight, ShieldCheck, Ticket, LayoutDashboard } from 'lucide-react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

const getPublicCharitiesFn = async () => {
  const { data } = await api.get('/charities');
  return data.data;
};

const LandingPage = () => {
  const { data: charities } = useQuery({
    queryKey: ['publicCharities'],
    queryFn: getPublicCharitiesFn
  });

  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-purple-500/30">
      {/* NavBar */}
      <nav className="fixed top-0 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-pink-500" size={28} />
            <span className="text-2xl font-black tracking-tight">CharityRoll</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2">
                <LayoutDashboard size={18} />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-neutral-400 hover:text-white font-medium transition-colors">Log In</Link>
                <Link to="/signup" className="px-5 py-2.5 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full point-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Next draw is mathematically guaranteed to payout
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
            Play Golf. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
              Fund Causes.
            </span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            The world's first decentralized charity lottery. Enter your weekend golf scores, compete on the global leaderboard, and win massive cash prizes—while 10% of every ticket goes directly to your chosen NGO.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Subscribe for $10/mo <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mechanics / How it Works */}
      <section className="py-24 bg-neutral-900/50 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">How the Engine works</h2>
            <p className="text-neutral-400 text-lg">Transparent mechanics. Cryptographic-level payouts.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', title: '1. Fuel the Pool', desc: 'Securely subscribe for $10/month via Stripe. 90% goes into the mathematically locked Prize Pool, 10% instantly funnels to a Charity of your choice.' },
              { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: '2. Post your Score', desc: 'Played 18 holes this weekend? Log your score (1-45 over par). The system automatically curates the algorithmic matching baseline.' },
              { icon: Ticket, color: 'text-green-400', bg: 'bg-green-500/10', title: '3. The Match Engine', desc: 'On the 28th, an algorithmic draw matches scores. Match 5 gets 40% of the pool. If nobody matches 5, the jackpot rolls over to next month!' }
            ].map((step, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6`}>
                   <step.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities Marquee */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12">The NGOs We Power</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {charities?.map(c => (
               <div key={c.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-pink-500/30 transition-colors">
                  <div className="w-12 h-12 bg-neutral-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="text-neutral-500 group-hover:text-pink-400" />
                  </div>
                  <span className="font-bold text-center text-sm">{c.name}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 border-t border-neutral-800 text-center">
         <h2 className="text-4xl font-black mb-6">Ready to swing for Charity?</h2>
         {isAuthenticated ? (
           <Link to="/dashboard" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform inline-flex items-center gap-2">
              <LayoutDashboard size={20} />
              Open Dashboard
           </Link>
         ) : (
           <Link to="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all inline-block">
              Create Free Account
           </Link>
         )}
      </footer>
    </div>
  );
};

export default LandingPage;
