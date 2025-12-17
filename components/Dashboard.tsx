import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { POI, User, POICategory } from '../types';
import { Users, MapPin, Activity, TrendingUp } from 'lucide-react';

interface DashboardProps {
  pois: POI[];
  users: User[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const Dashboard: React.FC<DashboardProps> = ({ pois, users }) => {
  
  // Prepare data for charts
  const categoryData = Object.values(POICategory).map(cat => ({
    name: cat,
    count: pois.filter(p => p.category === cat).length
  }));

  const userRoleData = [
    { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
    { name: 'Manager', value: users.filter(u => u.role === 'manager').length },
    { name: 'Utilisateur', value: users.filter(u => u.role === 'user').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total POIs</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{pois.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Utilisateurs</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{users.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Actifs (24h)</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{users.filter(u => u.status === 'active').length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Requêtes API</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">1,234</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Répartition des POI par Catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.2} />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8'}} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} 
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Répartition des Utilisateurs</h3>
          <div className="h-64 flex justify-center items-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table Mockup */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white">Activité Récente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium">
              <tr>
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Cible</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-6 py-3 font-medium dark:text-white">Amadou Diallo</td>
                <td className="px-6 py-3 text-blue-600 dark:text-blue-400">Création</td>
                <td className="px-6 py-3">Jardin 2 Octobre</td>
                <td className="px-6 py-3 text-slate-400">Il y a 2 min</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-6 py-3 font-medium dark:text-white">Fatoumata Camara</td>
                <td className="px-6 py-3 text-orange-600 dark:text-orange-400">Modification</td>
                <td className="px-6 py-3">Musée Sandervalia</td>
                <td className="px-6 py-3 text-slate-400">Il y a 15 min</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-6 py-3 font-medium dark:text-white">Système</td>
                <td className="px-6 py-3 text-green-600 dark:text-green-400">Optimisation</td>
                <td className="px-6 py-3">Trajet #402</td>
                <td className="px-6 py-3 text-slate-400">Il y a 1h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};