
import React, { useState } from 'react';
import { User } from '../types';
import { Search, UserPlus, MoreVertical, Shield, Mail, Calendar, UserCheck, UserX, Trash2 } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onUpdate: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (user: User) => {
    onUpdate({
      ...user,
      status: user.status === 'active' ? 'inactive' : 'active'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Utilisateurs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gérez les accès et les rôles de l'équipe GeoNav.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-bold active:scale-95">
          <UserPlus size={18} />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher un membre par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table des Utilisateurs */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.15em] border-b dark:border-slate-700">
                <th className="px-6 py-5">Utilisateur</th>
                <th className="px-6 py-5">Rôle</th>
                <th className="px-6 py-5">Statut</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-100 dark:border-indigo-800">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={12}/> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={user.role === 'admin' ? 'text-red-500' : 'text-slate-400'} />
                      <span className={`text-xs font-black uppercase tracking-tight ${user.role === 'admin' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {user.status === 'active' ? <UserCheck size={12}/> : <UserX size={12}/>}
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onDelete(user.id)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
