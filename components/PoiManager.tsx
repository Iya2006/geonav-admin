import React, { useState } from 'react';
import { POI, POICategory } from '../types';
import { Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';

interface PoiManagerProps {
  pois: POI[];
  onAdd: (poi: POI) => void;
  onUpdate: (poi: POI) => void;
  onDelete: (id: string) => void;
}

const emptyPoi: POI = {
  id: '',
  name: '',
  category: POICategory.OTHER,
  latitude: 9.5092, // Conakry
  longitude: -13.7122, // Conakry
  description: '',
  address: ''
};

export const PoiManager: React.FC<PoiManagerProps> = ({ pois, onAdd, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPoi, setCurrentPoi] = useState<POI>(emptyPoi);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPois = pois.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPoi.id) {
      onUpdate(currentPoi);
    } else {
      onAdd({ ...currentPoi, id: Date.now().toString() });
    }
    setIsEditing(false);
    setCurrentPoi(emptyPoi);
  };

  const startEdit = (poi: POI) => {
    setCurrentPoi(poi);
    setIsEditing(true);
  };

  const startNew = () => {
    setCurrentPoi(emptyPoi);
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Points d'Intérêt</h2>
        <button 
          onClick={startNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nouveau POI
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher un POI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Content Area: Split View if Editing */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* List */}
        <div className={`flex-1 overflow-y-auto pr-2 ${isEditing ? 'hidden md:block' : ''}`}>
          <div className="grid grid-cols-1 gap-3">
            {filteredPois.map(poi => (
              <div key={poi.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{poi.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                      {poi.category}
                    </span>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{poi.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{poi.address}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(poi)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(poi.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Panel - Slide Over or Static */}
        {isEditing && (
          <div className="w-full md:w-96 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {currentPoi.id ? 'Modifier POI' : 'Nouveau POI'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                <input 
                  required
                  type="text" 
                  value={currentPoi.name}
                  onChange={e => setCurrentPoi({...currentPoi, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                <select 
                  value={currentPoi.category}
                  onChange={e => setCurrentPoi({...currentPoi, category: e.target.value as POICategory})}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {Object.values(POICategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={currentPoi.latitude}
                    onChange={e => setCurrentPoi({...currentPoi, latitude: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={currentPoi.longitude}
                    onChange={e => setCurrentPoi({...currentPoi, longitude: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
                <input 
                  type="text" 
                  value={currentPoi.address || ''}
                  onChange={e => setCurrentPoi({...currentPoi, address: e.target.value})}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={currentPoi.description}
                  onChange={e => setCurrentPoi({...currentPoi, description: e.target.value})}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex justify-center items-center gap-2">
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};