import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trophy, CreditCard, ArrowRight, ShieldCheck, Ticket, LayoutDashboard, Globe, Users, Sparkles } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* NavBar */}
      <nav className="fixed top-0 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Heart className="text-pink-500 fill-pink-500/10" size={28} />
            <span className="text-2xl font-black tracking-tight">CharityRoll</span>
          </motion.div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
                <LayoutDashboard size={18} />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-neutral-400 hover:text-white font-medium transition-colors">Log In</Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className="px-5 py-2.5 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all shadow-xl shadow-white/5">Get Started</Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full point-events-none" />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-6 relative z-10 text-center"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold mb-8"
          >
            <Sparkles size={16} className="text-purple-400" />
            Empowering over 50+ global NGOs through play
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-balance"
          >
            Winning is <span className="text-neutral-500italic">Giving.</span> <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
              Fueling Change.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed text-balance"
          >
            A new kind of philanthropy. We believe in the power of collective play. Compete for major rewards while 10% of every subscription transforms lives across the globe.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/40">
                Join the Mission — $10/mo <ArrowRight size={22} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Impact Stats */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-y border-neutral-800 py-20 bg-neutral-900/20 backdrop-blur-sm rounded-[3rem]">
            {[
              { icon: Globe, label: "Global Payouts", value: "$420K+", desc: "Distributed to winners monthly" },
              { icon: Heart, label: "Impact Created", value: "$50K+", desc: "Directly donated to vetted NGOs" },
              { icon: Users, label: "Active Donors", value: "12,000+", desc: "Compete and give every weekend" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                  <stat.icon className="text-purple-400" size={24} />
                </div>
                <div className="text-4xl font-black mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-2">{stat.label}</div>
                <div className="text-neutral-400 text-sm max-w-[200px]">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanics / How it Works */}
      <section className="py-32 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">The Altruism Engine</h2>
              <p className="text-neutral-400 text-xl leading-relaxed">We've automated giving by integrating it with the competition you already love.</p>
            </div>
            <div className="flex items-center gap-2 text-neutral-500 font-bold mb-4 uppercase tracking-tighter">
              <ShieldCheck className="text-green-500" size={20} /> Procedurally Transparent
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Empowerment', desc: 'Securely subscribe. 90% fuels the rewards, 10% instantly funnels to your chosen community project.' },
              { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Performance', desc: 'Post your weekend achievements. Our system curates your score against the global matching baseline.' },
              { icon: Ticket, color: 'text-green-400', bg: 'bg-green-500/10', title: 'Transformation', desc: 'On the 28th, the engine calculates the match. Winners win big, but humanity wins every day.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group bg-neutral-900/80 border border-neutral-800 p-10 rounded-[2.5rem] hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className={`w-16 h-16 rounded-3xl ${step.bg} ${step.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                   <step.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-lg">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities Marquee */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Partners in Change</h2>
            <p className="text-neutral-400 text-xl">The NGOs receiving your direct support.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
             {charities?.map((c, i) => (
               <motion.div 
                 key={c.id}
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.05 }}
                 viewport={{ once: true }}
                 className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-pink-500/30 hover:bg-neutral-800/50 transition-all cursor-default"
               >
                  <div className="w-14 h-14 bg-neutral-950 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-inner">
                    <ShieldCheck className="text-neutral-600 group-hover:text-pink-400" size={28} />
                  </div>
                  <span className="font-extrabold text-center text-xs uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">{c.name}</span>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-tight"
          >
            Ready to change the world <br/> while you play?
          </motion.h2>
          
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/dashboard" className="px-12 py-6 bg-white text-black font-black text-xl rounded-3xl hover:bg-neutral-200 transition-all inline-flex items-center gap-3 shadow-2xl">
                <LayoutDashboard size={24} />
                Enter the Dashboard
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signup" className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xl rounded-3xl transition-all inline-block shadow-2xl shadow-purple-500/50">
                Become a Founder Member
              </Link>
            </motion.div>
          )}
          
          <p className="mt-8 text-neutral-500 font-bold uppercase tracking-[0.2em] text-sm">
            Instant Signup • Secure via Stripe • 100% Transparent
          </p>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-900 text-center text-neutral-600 font-medium">
        &copy; {new Date().getFullYear()} CharityRoll. All rights reserved. Built for Impact.
      </footer>
    </div>
  );
};

export default LandingPage;
