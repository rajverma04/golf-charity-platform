import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { updateProfileFn } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, Camera } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfileFn,
    onSuccess: (res) => {
      toast.success('Profile updated successfully!');
      setUser(res.data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });

  const onSubmit = (data) => {
    // Remove empty password to avoid unnecessary hashing
    const filteredData = { ...data };
    if (!filteredData.password) delete filteredData.password;
    mutation.mutate(filteredData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="text-blue-500" /> Account Settings
        </h1>
        <p className="text-neutral-400 mt-2">Manage your personal information and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl text-center flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-xl ring-4 ring-neutral-900 border-2 border-white/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-neutral-800 border border-neutral-700 rounded-full text-neutral-400 hover:text-white transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-white mt-6">{user?.name}</h2>
          <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-bold">
            {user?.role}
          </p>
          <div className="mt-8 w-full pt-8 border-t border-neutral-800 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500">Joined</span>
              <span className="text-neutral-300 font-medium">{new Date(user?.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500">Status</span>
              <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-xs font-bold uppercase">Active</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all opacity-80"
                  placeholder="jane@example.com"
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Lock size={14} /> New Password (leave blank to keep current)
              </label>
              <input 
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={mutation.isPending}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <Save size={18} />
                {mutation.isPending ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
