import { useQuery } from '@tanstack/react-query';
import { getAllUsersFn } from '../api/admin.api';

const AdminUsersTab = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAllUsersFn,
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">User Management</h2>
      {isLoading ? (
        <p className="text-neutral-500">Loading network...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-900 border-b border-neutral-800">
              <tr className="text-neutral-400 text-sm">
                <th className="py-4 font-medium px-6">Name</th>
                <th className="py-4 font-medium px-6">Email</th>
                <th className="py-4 font-medium px-6">Role</th>
                <th className="py-4 font-medium px-6">Sub Plan</th>
                <th className="py-4 font-medium px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {users?.map(u => (
                <tr key={u.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="py-4 px-6 text-white font-medium">{u.name}</td>
                  <td className="py-4 px-6 text-neutral-400 text-sm">{u.email}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded bg-neutral-950 text-xs uppercase tracking-widest ${u.role==='admin'?'text-purple-400':'text-neutral-500'}`}>{u.role}</span>
                  </td>
                  <td className="py-4 px-6 text-neutral-300 capitalize">{u.plan || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.sub_status==='active'?'bg-green-500/10 text-green-400':'bg-neutral-800 text-neutral-500'}`}>
                      {u.sub_status || 'none'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
