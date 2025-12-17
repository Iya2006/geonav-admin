
import React, { useState, useEffect } from 'react';
import { ViewState, POI, User, POICategory } from './types';
import { Dashboard } from './components/Dashboard';
import { PoiManager } from './components/PoiManager';
import { MapInterface } from './components/MapInterface';
import { SettingsView } from './components/SettingsView';
import { UserManager } from './components/UserManager';
import { Layout, Map, Users as UsersIcon, Home, Settings, LogOut, MapPin, Menu as MenuIcon, X } from 'lucide-react';

const MOCK_POIS: POI[] = [
  { id: '1', name: 'Grande Mosquée de Conakry', category: POICategory.OTHER, latitude: 9.5370, longitude: -13.6785, description: 'La plus grande mosquée de Guinée.', address: 'Route du Niger, Conakry', image: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&q=80&w=800' },
  { id: '2', name: 'Musée National de Sandervalia', category: POICategory.MUSEUM, latitude: 9.5123, longitude: -13.7100, description: 'Musée présentant l\'histoire guinéenne.', address: 'Kaloum, Conakry', image: 'https://images.unsplash.com/photo-1566121933407-3c7ccdd26763?auto=format&fit=crop&q=80&w=800' },
  { id: '3', name: 'Jardin 2 Octobre', category: POICategory.PARK, latitude: 9.5450, longitude: -13.6800, description: 'Grand espace vert.', address: 'Conakry', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800' },
];

const MOCK_USERS: User[] = [
  { id: '1', name: 'Amadou Diallo', email: 'amadou@geonav.gn', role: 'admin', status: 'active', lastActive: '2023-10-27T10:00:00' },
  { id: '2', name: 'Fatoumata Camara', email: 'fatou@geonav.gn', role: 'manager', status: 'active', lastActive: '2023-10-27T11:30:00' },
  { id: '3', name: 'Moussa Sylla', email: 'moussa@geonav.gn', role: 'user', status: 'inactive', lastActive: '2023-10-25T09:00:00' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('map');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [pois, setPois] = useState<POI[]>(MOCK_POIS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard pois={pois} users={users} />;
      case 'map': return <MapInterface pois={pois} userLocation={userLocation} />;
      case 'pois': return <PoiManager pois={pois} onAdd={p => setPois([...pois, p])} onUpdate={p => setPois(pois.map(x => x.id === p.id ? p : x))} onDelete={id => setPois(pois.filter(x => x.id !== id))} />;
      case 'users': return <UserManager users={users} onUpdate={u => setUsers(users.map(x => x.id === u.id ? u : x))} onDelete={id => setUsers(users.filter(x => x.id !== id))} />;
      case 'settings': return <SettingsView isDarkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />;
      default: return <MapInterface pois={pois} userLocation={userLocation} />;
    }
  };

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar de l'Admin App */}
      <aside className={`fixed inset-y-0 left-0 z-[2000] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b dark:border-slate-800">
            <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl">
              <Layout size={24} /> <span>GeoNav GN</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2"><X size={20}/></button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 mt-4">
            <NavItem icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); if(window.innerWidth < 1024) setIsSidebarOpen(false);}} />
            <NavItem icon={Map} label="Carte Interactive" active={currentView === 'map'} onClick={() => {setCurrentView('map'); if(window.innerWidth < 1024) setIsSidebarOpen(false);}} />
            <NavItem icon={MapPin} label="Points d'Intérêt" active={currentView === 'pois'} onClick={() => {setCurrentView('pois'); if(window.innerWidth < 1024) setIsSidebarOpen(false);}} />
            <NavItem icon={UsersIcon} label="Utilisateurs" active={currentView === 'users'} onClick={() => {setCurrentView('users'); if(window.innerWidth < 1024) setIsSidebarOpen(false);}} />
            <NavItem icon={Settings} label="Paramètres" active={currentView === 'settings'} onClick={() => {setCurrentView('settings'); if(window.innerWidth < 1024) setIsSidebarOpen(false);}} />
          </nav>
          
          <div className="p-4 border-t dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700 mb-4">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Administrateur</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AD</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate dark:text-white">Amadou D.</p>
                  <p className="text-[10px] text-slate-400 truncate">amadou@geonav.gn</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-all active:scale-95">
              <LogOut size={20}/> <span className="text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Header (uniquement visible hors carte ou sur mobile) */}
        {currentView !== 'map' && (
          <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center px-4 md:px-8 justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><MenuIcon size={24}/></button>
              <h2 className="font-black text-lg md:text-xl truncate uppercase tracking-tight text-slate-800 dark:text-white">
                {currentView === 'dashboard' && 'Supervision'}
                {currentView === 'pois' && 'Gestion POI'}
                {currentView === 'users' && 'Gestion Équipe'}
                {currentView === 'settings' && 'Système'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
               <div className="hidden md:flex flex-col items-end">
                  <p className="text-xs font-black dark:text-white">GeoNav Guinée</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Version 1.0.4</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-black text-indigo-600 border border-indigo-200 dark:border-indigo-800">AD</div>
            </div>
          </header>
        )}
        
        {/* View Content */}
        <main className={`flex-1 overflow-auto ${currentView !== 'map' ? 'p-4 md:p-8' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-sm font-black transition-all group ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600'}`}>
    <Icon size={20} className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
    <span className="uppercase tracking-tight">{label}</span>
  </button>
);

export default App;
