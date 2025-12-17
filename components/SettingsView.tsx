import React from 'react';
import { Save, Bell, Moon, Globe, Shield } from 'lucide-react';

interface SettingsViewProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Globe size={20} className="text-indigo-600 dark:text-indigo-400" />
          Préférences Générales
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <Bell size={20} />
              </div>
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-200 block">Notifications</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Recevoir des alertes pour les nouveaux utilisateurs</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <hr className="border-slate-100 dark:border-slate-700" />
          
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <Moon size={20} />
              </div>
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-200 block">Mode Sombre</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Activer le thème sombre pour l'interface</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isDarkMode}
                onChange={toggleDarkMode}
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
          Configuration API & Sécurité
        </h3>
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clé API Google Maps</label>
                <input type="password" value="AIzaSyB************************" readOnly className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 font-mono text-sm" />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clé API Gemini</label>
                <input type="password" value="AIzaSyC************************" readOnly className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 font-mono text-sm" />
            </div>
         </div>
       </div>

       <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                <Save size={18} />
                Enregistrer les modifications
            </button>
       </div>
    </div>
  );
};