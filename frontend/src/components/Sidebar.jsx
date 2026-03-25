import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Ticket, Trophy, Heart, CreditCard, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { logoutFn } from '../features/auth/api/auth.api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clearLocalStore = useAuthStore((state) => state.logout);

  const logoutMutation = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      clearLocalStore();
      navigate('/login');
      toast.success('Logged out successfully');
    },
    onError: () => {
      clearLocalStore(); // fallback local wipe
      navigate('/login');
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Draws', path: '/draws', icon: Ticket },
    { label: 'Scores', path: '/scores', icon: Trophy },
    { label: 'Charities', path: '/charities', icon: Heart },
    { label: 'Winners', path: '/winners', icon: ShieldCheck },
    { label: 'Subscription', path: '/subscription', icon: CreditCard },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="w-64 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          CharityLottery
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all \${
                isActive 
                  ? 'bg-purple-600/20 text-purple-400 font-semibold' 
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-purple-400' : 'text-neutral-500'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <LogOut size={20} />
          <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
