import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Driver } from '../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Navigation, Target, Activity, WifiOff, MapPin } from 'lucide-react';

const createDriverIcon = (status: 'MOVING' | 'PARKED' | 'OFFLINE') => {
  let color = '#94a3b8'; // Offline gray
  if (status === 'MOVING') color = '#10b981';
  else if (status === 'PARKED') color = '#ef4444';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 17h4V5H2v12h3"/>
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/>
    <path d="M14 17h1"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>`;
  
  return L.divIcon({
    html: svg,
    className: 'bg-transparent border-0 drop-shadow-md transition-transform duration-[2000ms] ease-linear',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface MapProps {
  drivers: Driver[];
}

interface LocationData {
  driverId: string;
  lat: number;
  lng: number;
  status: 'MOVING' | 'PARKED' | 'OFFLINE';
  speed?: number;
  heading?: number;
  accuracy?: number;
  updatedAt: string;
}

// Helper to access Leaflet map instance
function MapController({ onMapReady, onDragStart }: { onMapReady: (map: L.Map) => void, onDragStart: () => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
    map.on('dragstart', onDragStart);
    return () => {
      map.off('dragstart', onDragStart);
    };
  }, [map, onMapReady, onDragStart]);
  return null;
}

export default function FleetMap({ drivers }: MapProps) {
  const [locations, setLocations] = useState<Record<string, LocationData>>({});
  const [autoFollow, setAutoFollow] = useState<string | null>(null);
  const [hasInitialCentered, setHasInitialCentered] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  
  const [now, setNow] = useState(Date.now());
  
  // Update "now" every 5 seconds to refresh online/offline status
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDragStart = useCallback(() => {
    setAutoFollow(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'locations'), (snapshot) => {
      let isFirstCenter = false;
      
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data() as LocationData;
        const driverId = change.doc.id;
        
        // Update marker imperatively for max performance
        const marker = markersRef.current[driverId];
        if (marker && data.lat && data.lng) {
          marker.setLatLng([data.lat, data.lng]);
          
          // Update icon if status changed
          const isOffline = (Date.now() - new Date(data.updatedAt).getTime()) > 300000;
          const status = isOffline ? 'OFFLINE' : (data.status || 'PARKED');
          marker.setIcon(createDriverIcon(status));
        }
        
        // Auto-follow logic
        if (autoFollow === driverId && mapRef.current) {
          mapRef.current.setView([data.lat, data.lng], mapRef.current.getZoom(), { animate: true, duration: 2 });
        }
        
        // Center on first location received
        if (!hasInitialCentered && data.lat && data.lng && mapRef.current) {
          isFirstCenter = true;
          mapRef.current.setView([data.lat, data.lng], 13);
        }
      });
      
      if (isFirstCenter) {
        setHasInitialCentered(true);
      }

      // Also update state for Sidebar
      const locData: Record<string, LocationData> = {};
      snapshot.forEach(doc => {
        locData[doc.id] = doc.data() as LocationData;
      });
      setLocations(locData);
    });

    return () => unsubscribe();
  }, [autoFollow, hasInitialCentered]);

  const center: [number, number] = [-15.793889, -47.882778];

  const mapMarkers = drivers.map(driver => {
    const realTimeLoc = locations[driver.id];
    let status: 'MOVING' | 'PARKED' | 'OFFLINE' = 'OFFLINE';
    
    if (realTimeLoc && realTimeLoc.updatedAt) {
      const lastUpdate = new Date(realTimeLoc.updatedAt).getTime();
      const diffSeconds = (Date.now() - lastUpdate) / 1000;
      status = diffSeconds > 300 ? 'OFFLINE' : (realTimeLoc.status || 'PARKED');
    } else {
      status = driver.status === 'MOVING' ? 'MOVING' : 'PARKED';
    }
    
    return {
      ...driver,
      lat: realTimeLoc?.lat ?? driver.lat,
      lng: realTimeLoc?.lng ?? driver.lng,
      status,
      speed: realTimeLoc?.speed,
      accuracy: realTimeLoc?.accuracy,
      updatedAt: realTimeLoc?.updatedAt
    };
  }).filter(d => d.lat !== undefined && d.lng !== undefined);

  const handleCenterDriver = (driverId: string, lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15, { animate: true });
    }
    setAutoFollow(driverId);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row z-0 relative bg-white">
      <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-1/3 md:h-full z-10 relative shadow-sm shrink-0">
        <div className="p-2 md:p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Rastreamento Tempo Real</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mapMarkers.length === 0 ? (
            <div className="p-3 md:p-6 text-center text-slate-500 text-xs md:text-sm">
              Nenhum motorista com localização registrada.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {mapMarkers.map(driver => (
                <li 
                  key={driver.id} 
                  className={`p-3 md:p-4 hover:bg-slate-50 cursor-pointer transition-colors group flex flex-col gap-2 ${autoFollow === driver.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => handleCenterDriver(driver.id, driver.lat!, driver.lng!)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900 flex items-center gap-1.5">
                        {driver.name}
                        {autoFollow === driver.id && <span title="Seguindo automaticamente"><Target size={14} className="text-indigo-600 animate-pulse" /></span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{driver.vehiclePlateHorse}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {driver.status === 'OFFLINE' ? (
                        <WifiOff size={14} className="text-slate-400" />
                      ) : (
                        <Activity size={14} className={driver.status === 'MOVING' ? 'text-emerald-500' : 'text-amber-500'} />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full ${
                      driver.status === 'OFFLINE' ? 'bg-slate-100 text-slate-500' : 
                      driver.status === 'MOVING' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {driver.status === 'OFFLINE' ? 'Motorista offline' : driver.status === 'MOVING' ? 'Motorista online' : 'Motorista online (Parado)'}
                    </span>
                    
                    {driver.speed !== undefined && driver.status !== 'OFFLINE' && (
                      <span className="text-xs font-medium text-slate-600">
                        {Math.round(driver.speed * 3.6)} km/h
                      </span>
                    )}
                  </div>
                  <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCenterDriver(driver.id, driver.lat!, driver.lng!);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                    >
                      <MapPin size={14} />
                      Centralizar no motorista
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative min-h-0 z-0">
        <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="w-full h-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController 
            onMapReady={(map) => { mapRef.current = map; }} 
            onDragStart={handleDragStart}
          />
          
          {mapMarkers.map((driver) => (
            <Marker 
              key={driver.id} 
              position={[driver.lat!, driver.lng!]}
              icon={createDriverIcon(driver.status)}
              ref={(ref) => {
                if (ref) markersRef.current[driver.id] = ref;
              }}
            >
              <Popup className="rounded-lg">
                <div className="p-1 min-w-[150px]">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    {driver.name}
                    {driver.status === 'OFFLINE' ? <WifiOff size={14} className="text-slate-400" /> : <Activity size={14} className="text-emerald-500" />}
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 mb-2">Placa: {driver.vehiclePlateHorse}</div>
                  
                  <div className="space-y-1 mt-2 p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-medium text-slate-700">
                        {driver.status === 'OFFLINE' ? 'Offline' : driver.status === 'MOVING' ? 'Em Movimento' : 'Parado'}
                      </span>
                    </div>
                    {driver.speed !== undefined && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Velocidade:</span>
                        <span className="font-medium text-slate-700">{Math.round(driver.speed * 3.6)} km/h</span>
                      </div>
                    )}
                    {driver.accuracy !== undefined && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Precisão GPS:</span>
                        <span className="font-medium text-slate-700">±{Math.round(driver.accuracy)}m</span>
                      </div>
                    )}
                  </div>
                  
                  {driver.updatedAt && (
                    <div className="text-[10px] text-slate-400 mt-2 text-center">
                      Atualizado: {new Date(driver.updatedAt).toLocaleTimeString('pt-BR')}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
