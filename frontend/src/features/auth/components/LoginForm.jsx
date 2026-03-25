import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { loginFn } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginFn,
    onSuccess: (res) => {
      toast.success('Welcome back!');
      setUser(res.data.user);
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-neutral-800 shadow-xl border border-neutral-700">
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Sign In
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
          <input 
            type="email" 
            {...register('email')}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
          <input 
            type="password" 
            {...register('password')}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {mutation.isPending ? 'Signing in...' : 'Sign In'}
        </button>

      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Don't have an account? <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">Create one</Link>
      </p>
    </div>
  );
};

export default LoginForm;
