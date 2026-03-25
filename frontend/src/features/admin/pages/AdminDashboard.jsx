import { useState } from 'react';
import { Users, Building2, Award, PlayCircle, BarChart3 } from 'lucide-react';

import AdminUsersTab from '../components/AdminUsersTab';
import AdminWinnersTab from '../components/AdminWinnersTab';
import AdminCharitiesTab from '../components/AdminCharitiesTab';
import AdminDrawsTab from '../components/AdminDrawsTab';
import AdminAnalyticsTab from '../components/AdminAnalyticsTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-600' },
    { id: 'users', label: 'User Management', icon: Users, color: 'text-purple-400', bg: 'bg-purple-600' },
    { id: 'draws', label: 'Draw Management', icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-600' },
    { id: 'winners', label: 'Winners Management', icon: Award, color: 'text-green-400', bg: 'bg-green-600' },
    { id: 'charities', label: 'Charity Management', icon: Building2, color: 'text-pink-400', bg: 'bg-pink-600' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Control Center</h1>
        <p className="text-neutral-400 mt-2">Manage your platform's users, funds, charities, and payouts across 5 major domains.</p>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-neutral-900 border border-neutral-800 p-2 rounded-2xl w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[160px] px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? `${tab.bg} text-white shadow-lg` 
                : `text-neutral-400 hover:text-white hover:bg-neutral-800`
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : tab.color} /> 
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Active Component Module cleanly */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 overflow-hidden min-h-[500px]">
         {activeTab === 'analytics' && <AdminAnalyticsTab />}
         {activeTab === 'users' && <AdminUsersTab />}
         {activeTab === 'draws' && <AdminDrawsTab />}
         {activeTab === 'winners' && <AdminWinnersTab />}
         {activeTab === 'charities' && <AdminCharitiesTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
