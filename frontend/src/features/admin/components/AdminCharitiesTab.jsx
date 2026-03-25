import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { createCharityFn, updateCharityFn, deleteCharityFn } from '../api/admin.api';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';

const AdminCharitiesTab = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ id: null, name: '', description: '', image_url: '' });

  const { data: charities, isLoading } = useQuery({
    queryKey: ['adminCharities'],
    queryFn: async () => {
      const { data } = await api.get('/charities');
      return data.data;
    }
  });

  const createMut = useMutation({
    mutationFn: (payload) => createCharityFn(payload),
    onSuccess: () => { toast.success('Charity added'); queryClient.invalidateQueries({queryKey:['adminCharities']}); setForm({id:null, name:'', description:'', image_url:''}); }
  });

  const updateMut = useMutation({
    mutationFn: (payload) => updateCharityFn({ id: form.id, payload }),
    onSuccess: () => { toast.success('Charity updated'); queryClient.invalidateQueries({queryKey:['adminCharities']}); setForm({id:null, name:'', description:'', image_url:''}); }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteCharityFn(id),
    onSuccess: () => { toast.success('Charity deleted'); queryClient.invalidateQueries({queryKey:['adminCharities']}); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) updateMut.mutate({ name: form.name, description: form.description, image_url: form.image_url });
    else createMut.mutate({ name: form.name, description: form.description, image_url: form.image_url });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">NGO Registry Management</h2>
      <p className="text-neutral-400 mb-6 -mt-4 text-sm">Add, Edit, and Delete supported charities dynamically across the globe.</p>
      
      <form onSubmit={handleSubmit} className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 mb-8">
        <h3 className="text-lg font-bold text-white mb-2">{form.id ? 'Edit NGO Parameters' : 'Enroll New Foundation'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder="Organization Title (e.g. Red Cross)" className="bg-neutral-900 border border-neutral-800 text-white p-3 rounded-xl w-full outline-none focus:border-pink-500 transition-colors" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          <input type="url" placeholder="Brand Avatar URL (HTTPS image link)" className="bg-neutral-900 border border-neutral-800 text-white p-3 rounded-xl w-full outline-none focus:border-pink-500 transition-colors" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} />
        </div>
        <textarea required placeholder="Provide a highly-detailed outline summarizing the exact geographic allocation and operational directives of this fund." className="bg-neutral-900 border border-neutral-800 text-white p-3 rounded-xl w-full outline-none focus:border-pink-500 transition-colors resize-none h-24" value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea>
        
        <div className="flex justify-end gap-3 pt-2">
          {form.id && <button type="button" onClick={() => setForm({id:null, name:'', description:'', image_url:''})} className="px-5 py-2 hover:bg-neutral-800 rounded-xl text-neutral-400 font-bold transition-colors">Discard Draft</button>}
          <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
            {form.id ? 'Commit Changes' : 'Broadcast to Network'}
          </button>
        </div>
      </form>

      {isLoading ? <p className="text-neutral-500">Aggregating global philanthropic ledgers...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charities?.map(c => (
            <div key={c.id} className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl flex flex-col gap-4 group hover:border-pink-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl group-hover:bg-pink-500/10 transition-colors z-0 pointer-events-none"></div>
              
              <div className="flex items-start gap-4 z-10">
                 {c.image_url ? <img src={c.image_url} alt="logo" className="w-12 h-12 rounded-full object-cover bg-neutral-900 border border-neutral-800 shrink-0" /> : <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0"><Building2 size={20} className="text-neutral-500"/></div>}
                 <div>
                    <h4 className="font-bold text-white text-lg leading-tight line-clamp-1">{c.name}</h4>
                    <p className="text-neutral-500 text-xs font-mono mt-1">ID: {c.id.split('-')[0]}</p>
                 </div>
              </div>
              
              <p className="text-neutral-400 text-sm flex-1 line-clamp-3 z-10">{c.description}</p>
              
              <div className="flex items-center gap-3 mt-2 pt-4 border-t border-neutral-800/50 z-10">
                <button onClick={() => setForm(c)} className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-bold transition-colors flex justify-center">Edit</button>
                <button onClick={() => { if(window.confirm('Delete this charity forever?')) deleteMut.mutate(c.id); }} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-colors flex justify-center disabled:opacity-50" disabled={deleteMut.isPending}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCharitiesTab;
