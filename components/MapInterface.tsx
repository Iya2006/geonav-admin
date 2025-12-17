
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { POI, SearchResultPlace, TransportMode } from '../types';
import { searchPlacesWithGemini, optimizeRouteWithGemini } from '../services/geminiService';
// Added missing Utensils, Hotel, Fuel, and ParkingCircle icons to imports
import { 
  Search, Navigation, Menu, Bookmark, Clock, MessageSquare, Share2, 
  Printer, PlusCircle, FileText, Shield, Info, Languages, Settings, 
  HelpCircle, Lightbulb, X, LocateFixed, Smartphone, Car, 
  PersonStanding, TrainFront, Bike, MapPin, Loader2, Sparkles, 
  ArrowRightLeft, Plus, ChevronLeft, Star, Heart, Flag, MoreVertical,
  Utensils, Hotel, Fuel, ParkingCircle
} from 'lucide-react';

interface MapInterfaceProps {
  pois: POI[];
  userLocation: { lat: number; lng: number } | null;
}

type SubView = 'main' | 'google-menu' | 'directions' | 'saved' | 'contributions' | 'recent' | 'location-sharing' | 'trajets';

export const MapInterface: React.FC<MapInterfaceProps> = ({ pois, userLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<SubView>('main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const [selectedPoisForRoute, setSelectedPoisForRoute] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Mock history/saved for "A to Z" functionality
  const [recentSearches] = useState(['Marché de Madina', 'Aéroport de Conakry', 'Plage de Rogbané']);
  const [savedPlaces] = useState(pois.slice(0, 2));
  const [contributions] = useState([
    { id: 'c1', name: 'Restaurant Le Cèdre', type: 'Photo ajoutée', date: 'Hier' },
    { id: 'c2', name: 'Pharmacie Kaloum', type: 'Avis 5 étoiles', date: '2 oct.' }
  ]);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = userLocation?.lat || 9.5092;
    const initialLng = userLocation?.lng || -13.7122;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    mapRef.current = map;
    
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Ensure map updates when sidebar state changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  }, [isSidebarOpen]);

  // Sync Markers
  useEffect(() => {
    if (!mapRef.current) return;

    (Object.values(markersRef.current) as L.Marker[]).forEach(m => m.remove());
    markersRef.current = {};

    pois.forEach(poi => {
      const popupHtml = `
        <div class="overflow-hidden bg-white dark:bg-slate-800">
          ${poi.image ? `<img src="${poi.image}" class="w-full h-32 object-cover" />` : ''}
          <div class="p-4">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white">${poi.name}</h3>
            <p class="text-xs font-bold text-indigo-600 uppercase mt-0.5">${poi.category}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">${poi.description}</p>
            <div class="mt-4 flex gap-2">
              <button class="flex-1 bg-indigo-600 text-white text-xs py-2 rounded-lg font-bold shadow-md active:scale-95 transition-all">Y aller</button>
              <button class="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><Bookmark size={16}/></button>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([poi.latitude, poi.longitude])
        .addTo(mapRef.current!)
        .bindPopup(popupHtml, { className: 'custom-leaflet-popup', maxWidth: 280 });
      
      markersRef.current[poi.id] = marker;
    });
  }, [pois]);

  // Update user location
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div class="relative"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div><div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div></div>`,
      iconSize: [16, 16]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(mapRef.current);
    }
  }, [userLocation]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchPlacesWithGemini(searchQuery, userLocation?.lat, userLocation?.lng);
      if (results.length > 0 && mapRef.current) {
        const first = results[0];
        mapRef.current.flyTo([first.latitude, first.longitude], 16);
        if (tempMarkerRef.current) tempMarkerRef.current.remove();
        tempMarkerRef.current = L.marker([first.latitude, first.longitude]).addTo(mapRef.current).bindPopup(`<b>${first.name}</b><br>${first.address}`).openPopup();
        showToast(`Trouvé : ${first.name}`, 'success');
      } else {
        showToast("Aucun lieu trouvé", 'info');
      }
    } finally { setIsSearching(false); }
  };

  const handleOptimizeRoute = async () => {
    if (selectedPoisForRoute.length < 1) return;
    setIsOptimizing(true);
    try {
      const poisToVisit = pois.filter(p => selectedPoisForRoute.includes(p.id));
      const start = userLocation || { lat: poisToVisit[0].latitude, lng: poisToVisit[0].longitude };
      const result = await optimizeRouteWithGemini(start, poisToVisit);
      
      if (routeLayerRef.current) routeLayerRef.current.remove();
      const routePoints: [number, number][] = [[start.lat, start.lng]];
      result.orderedIds.forEach(id => {
        const p = pois.find(poi => poi.id === id);
        if (p) routePoints.push([p.latitude, p.longitude]);
      });

      const polyline = L.polyline(routePoints, { color: '#4f46e5', weight: 5, opacity: 0.7, lineJoin: 'round' }).addTo(mapRef.current!);
      mapRef.current!.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      routeLayerRef.current = polyline;
      showToast("Trajet optimisé par IA", 'success');
    } catch (e) {
      showToast("Erreur lors de l'optimisation", 'info');
    } finally {
      setIsOptimizing(false);
    }
  };

  const recenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16);
      showToast("Position centrée", 'info');
    } else {
      showToast("Localisation indisponible", 'info');
    }
  };

  const goToPlace = (poi: POI) => {
    if (mapRef.current) {
      mapRef.current.flyTo([poi.latitude, poi.longitude], 17);
      markersRef.current[poi.id]?.openPopup();
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  };

  // Views Renderers
  const renderSidebarContent = () => {
    switch (currentView) {
      case 'google-menu':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="font-bold text-slate-800 dark:text-white">Options de navigation</h2>
              <button onClick={() => setCurrentView('main')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
            </div>
            <div className="py-2 space-y-1">
              <MenuButton icon={Bookmark} label="Adresses enregistrées" onClick={() => setCurrentView('saved')} />
              <MenuButton icon={Clock} label="Recherches récentes" onClick={() => setCurrentView('recent')} />
              <MenuButton icon={MessageSquare} label="Vos contributions" onClick={() => setCurrentView('contributions')} active />
              <MenuButton icon={LocateFixed} label="Partage de position" onClick={() => setCurrentView('location-sharing')} />
              <MenuButton icon={Navigation} label="Vos trajets" onClick={() => setCurrentView('trajets')} />
              <MenuButton icon={Shield} label="Vos données dans Maps" onClick={() => showToast("Gestion des données active")} />
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2"></div>
            <div className="py-1">
              <MenuButton icon={Share2} label="Partager la carte" onClick={() => showToast("Lien de partage copié !")} />
              <MenuButton icon={Printer} label="Imprimer" onClick={() => window.print()} />
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm font-medium hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => showToast("Formulaire d'ajout ouvert")}>Ajouter un lieu manquant</p>
              <p className="text-sm font-medium hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => showToast("Mon établissement ouvert")}>Ajouter votre établissement</p>
              <p className="text-sm font-medium hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => showToast("Éditeur de carte ouvert")}>Modifier la carte</p>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2"></div>
            <div className="py-2 pb-10">
              <MenuButton icon={Lightbulb} label="Conseils et astuces" onClick={() => showToast("Guide d'utilisation")} />
              <MenuButton icon={HelpCircle} label="Obtenir de l'aide" onClick={() => showToast("Support technique")} />
              <MenuButton icon={Info} label="Information" onClick={() => showToast("Version 2.4.0")} />
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b flex items-center gap-4">
              <button onClick={() => setCurrentView('google-menu')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><ChevronLeft size={20}/></button>
              <h2 className="font-bold text-slate-800 dark:text-white">Favoris</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button className="flex-1 bg-slate-100 dark:bg-slate-800 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2"><Star size={14} className="text-yellow-500"/> Favoris</button>
                <button className="flex-1 bg-slate-100 dark:bg-slate-800 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2"><Heart size={14} className="text-red-500"/> À visiter</button>
              </div>
              <div className="space-y-4 mt-6">
                {savedPlaces.map(p => (
                  <div key={p.id} onClick={() => goToPlace(p)} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600"><MapPin size={24}/></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate">{p.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{p.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'contributions':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b flex items-center gap-4">
              <button onClick={() => setCurrentView('google-menu')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><ChevronLeft size={20}/></button>
              <h2 className="font-bold text-slate-800 dark:text-white">Vos contributions</h2>
            </div>
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Star size={40} fill="currentColor"/>
              </div>
              <h3 className="font-bold text-xl">Local Guide Niveau 4</h3>
              <p className="text-sm text-slate-400 mt-1">1 240 points • Prochain niveau dans 260 pts</p>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Activité récente</h4>
              {contributions.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 px-2 py-0.5 rounded-full uppercase">{c.type}</span>
                    <span className="text-[10px] text-slate-400">{c.date}</span>
                  </div>
                  <h5 className="font-bold text-sm">{c.name}</h5>
                  <button className="text-xs text-indigo-600 mt-2 font-bold hover:underline">Voir la contribution</button>
                </div>
              ))}
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all mt-4">Contribuer maintenant</button>
            </div>
          </div>
        );

      case 'recent':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b flex items-center gap-4">
              <button onClick={() => setCurrentView('google-menu')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><ChevronLeft size={20}/></button>
              <h2 className="font-bold text-slate-800 dark:text-white">Historique</h2>
            </div>
            <div className="p-4 space-y-2">
              {recentSearches.map((s, i) => (
                <div key={i} onClick={() => {setSearchQuery(s); setCurrentView('main'); handleSearch();}} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group">
                  <Clock size={18} className="text-slate-400" />
                  <span className="text-sm font-medium">{s}</span>
                </div>
              ))}
              <button onClick={() => showToast("Historique effacé")} className="w-full py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors mt-4">Effacer tout l'historique</button>
            </div>
          </div>
        );

      case 'directions':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-200">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <TransportIcon active={transportMode === 'driving'} onClick={() => setTransportMode('driving')} icon={Car} />
                  <TransportIcon active={transportMode === 'walking'} onClick={() => setTransportMode('walking')} icon={PersonStanding} />
                  <TransportIcon active={transportMode === 'transit'} onClick={() => setTransportMode('transit')} icon={TrainFront} />
                </div>
                <button onClick={() => setCurrentView('main')} className="p-2.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={22}/></button>
              </div>
              <div className="space-y-3 relative">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center py-2">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400"></div>
                    <div className="flex-1 w-[1.5px] border-l border-dashed border-slate-300 my-1"></div>
                    <MapPin size={16} className="text-red-500"/>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="relative">
                      <input className="w-full p-3 pl-4 text-sm border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 ring-indigo-500 transition-all font-medium" placeholder="Votre position actuelle" readOnly />
                      <div className="absolute right-3 top-3 text-indigo-600"><LocateFixed size={18}/></div>
                    </div>
                    <div className="relative">
                      <input className="w-full p-3 pl-4 text-sm border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 ring-indigo-500 transition-all font-medium" placeholder="Saisir la destination..." />
                      <div className="absolute right-3 top-3 text-slate-300"><PlusCircle size={18}/></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500"/> Optimisation intelligente</h3>
              <div className="space-y-2">
                {pois.map(p => (
                  <label key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${selectedPoisForRoute.includes(p.id) ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={selectedPoisForRoute.includes(p.id)} onChange={() => setSelectedPoisForRoute(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="rounded-md text-indigo-600 w-5 h-5 border-slate-300 focus:ring-indigo-500" />
                    <div className="flex-1">
                      <span className={`text-sm font-bold ${selectedPoisForRoute.includes(p.id) ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{p.name}</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-0.5">{p.category}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-5 border-t dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              <button onClick={handleOptimizeRoute} disabled={isOptimizing || selectedPoisForRoute.length < 1} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95">
                {isOptimizing ? <Loader2 size={24} className="animate-spin"/> : <Navigation size={22}/>}
                Lancer l'itinéraire IA
              </button>
            </div>
          </div>
        );

      default: // SubView 'main'
        return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in fade-in duration-300">
            {/* Search Box */}
            <div className="p-4 relative z-20">
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-2xl border border-slate-100 dark:border-slate-700 group focus-within:ring-2 ring-indigo-500/50 transition-all">
                <button onClick={() => setCurrentView('google-menu')} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"><Menu size={24} /></button>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-bold placeholder:text-slate-400" placeholder="Rechercher sur GeoNav..." />
                <button onClick={handleSearch} className="p-3 text-slate-500 hover:text-indigo-600 transition-colors">{isSearching ? <Loader2 size={20} className="animate-spin"/> : <Search size={24} />}</button>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button onClick={() => setCurrentView('directions')} className="p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all active:scale-90"><Navigation size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="relative h-56 group cursor-pointer overflow-hidden m-4 rounded-[2rem] shadow-xl">
                <img src="https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="Conakry" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="font-black text-2xl tracking-tighter uppercase italic">Conakry</h4>
                  <p className="text-[10px] opacity-90 uppercase tracking-[0.3em] font-black mt-1">Ville portuaire de Guinée</p>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
                  <ExploreCategory icon={Utensils} label="Cuisines" color="bg-green-600" onClick={() => showToast("Filtre Restaurants")} />
                  <ExploreCategory icon={Hotel} label="Hôtels" color="bg-cyan-600" onClick={() => showToast("Filtre Hôtels")} />
                  <ExploreCategory icon={Fuel} label="Essence" color="bg-red-600" onClick={() => showToast("Filtre Stations-service")} />
                  <ExploreCategory icon={ParkingCircle} label="Parkings" color="bg-yellow-600" onClick={() => showToast("Filtre Stationnements")} />
                  <ExploreCategory icon={Plus} label="Plus" color="bg-slate-600" onClick={() => setCurrentView('google-menu')} />
                </div>

                <div className="mt-4 space-y-8">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-black flex items-center gap-2 text-slate-800 dark:text-white uppercase tracking-wider"><Bookmark size={18} className="text-indigo-600"/> Enregistrés</h3>
                    <button onClick={() => setCurrentView('saved')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Voir tout</button>
                  </div>
                  <div className="space-y-4">
                    {pois.map(p => (
                      <div key={p.id} onClick={() => goToPlace(p)} className="flex items-center gap-5 p-4 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[1.5rem] border border-slate-50 dark:border-slate-800/50 hover:border-slate-100 transition-all cursor-pointer group shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><MapPin size={26}/></div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{p.name}</h5>
                          <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-widest mt-1">{p.address || p.category}</p>
                        </div>
                        <MoreVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full flex relative overflow-hidden bg-slate-50 font-sans selection:bg-indigo-200">
      
      {/* Toast Notification System */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[3000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-xl border ${toast.type === 'success' ? 'bg-indigo-600/90 text-white border-white/20' : 'bg-slate-900/90 text-white border-white/10'}`}>
          {toast.type === 'success' ? <CheckCircle size={20}/> : <Info size={20}/>}
          <span className="text-sm font-black uppercase tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Responsive */}
      <div className={`absolute top-0 left-0 h-full bg-white dark:bg-slate-900 shadow-2xl z-[2000] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-slate-200 dark:border-slate-800 ${isSidebarOpen ? 'w-full md:w-[420px] translate-x-0' : 'w-0 -translate-x-full'}`}>
        <div className="h-full w-full md:w-[420px] relative">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Floating Toggle Button (Appears when sidebar closed or for mobile) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className={`absolute top-4 left-4 z-[2001] bg-white dark:bg-slate-800 p-3.5 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 transition-all duration-500 hover:scale-110 active:scale-90 ${isSidebarOpen ? 'md:translate-x-[430px]' : 'translate-x-0'}`}
      >
        {isSidebarOpen ? <X size={24} className="text-slate-600 dark:text-slate-300"/> : <Menu size={24} className="text-slate-600 dark:text-slate-300"/>}
      </button>

      {/* Main Map Area */}
      <div className="flex-1 h-full w-full relative z-[1]">
        <div ref={mapContainerRef} className="w-full h-full grayscale-[0.1] dark:invert dark:hue-rotate-180 dark:brightness-90 transition-all duration-1000" />
        
        {/* Map UI Controls */}
        <div className="absolute bottom-10 right-6 md:right-10 z-[1000] flex flex-col gap-4">
          <button onClick={recenterMap} title="Recalibrer ma position" className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl hover:bg-indigo-600 hover:text-white transition-all text-indigo-600 border border-slate-200/50 dark:border-slate-700 hover:scale-110 active:rotate-12 group">
            <LocateFixed size={28} className="group-hover:scale-110 transition-transform"/>
          </button>
          <button onClick={() => showToast("Partage mobile envoyé", "success")} title="Envoyer au mobile" className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 hover:scale-110 active:scale-90">
            <Smartphone size={28}/>
          </button>
        </div>

        {/* Floating Zoom Controls (Standard G-Maps style) */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-[1000] flex flex-col gap-1">
          <button onClick={() => mapRef.current?.zoomIn()} className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-t-xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-b-0 border-slate-200 dark:border-slate-700 font-bold">+</button>
          <button onClick={() => mapRef.current?.zoomOut()} className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-b-xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold">-</button>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const MenuButton = ({ icon: Icon, label, onClick, active = false }: { icon: any, label: string, onClick: () => void, active?: boolean }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 transition-all duration-300 group border-l-[3px] ${active ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400'}`}>
    <Icon size={22} className={`transition-transform group-hover:scale-110 ${active ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}`} />
    <span className={`text-sm tracking-tight ${active ? 'font-black uppercase italic' : 'font-bold'}`}>{label}</span>
  </button>
);

const TransportIcon = ({ icon: Icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`p-3.5 rounded-2xl transition-all duration-300 active:scale-90 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-700'}`}>
    <Icon size={22}/>
  </button>
);

const ExploreCategory = ({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-3 group shrink-0 cursor-pointer active:scale-95 transition-transform">
    <div className={`w-16 h-16 ${color} rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-black/10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500`}>
      <Icon size={28} />
    </div>
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{label}</span>
  </div>
);

const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
