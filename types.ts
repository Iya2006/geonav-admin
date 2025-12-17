export interface POI {
  id: string;
  name: string;
  category: POICategory;
  latitude: number;
  longitude: number;
  description: string;
  address?: string;
  image?: string;
}

export enum POICategory {
  RESTAURANT = 'Restaurant',
  HOTEL = 'Hôtel',
  PARK = 'Parc',
  MUSEUM = 'Musée',
  SHOP = 'Commerce',
  OTHER = 'Autre',
  GAS_STATION = 'Station-service',
  PARKING = 'Stationnement'
}

export type TransportMode = 'driving' | 'walking' | 'transit' | 'bicycling' | 'flight';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface Route {
  id: string;
  name: string;
  stops: POI[];
  estimatedDuration?: string;
  optimizedOrder?: number[];
  notes?: string;
}

export type ViewState = 'dashboard' | 'map' | 'pois' | 'users' | 'settings';

export interface SearchResultPlace {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  category?: string;
  image?: string;
}