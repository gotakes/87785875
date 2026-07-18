import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Driver } from '../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Navigation } from 'lucide-react';
import { io } from 'socket.io-client';

// Custom SVG Icon for Leaflet using Lucide design language
const createDriverIcon = (status: 'MOVING' | 'PARKED') => {
  const color = status === 'MOVING' ? '#10b981' : '#ef4444'; // Emerald 500 : Red 500
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 17h4V5H2v12h3"/>
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/>
    <path d="M14 17h1"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: 'bg-transparent border-0 drop-shadow-md',
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Center of the icon
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
  status: 'MOVING' | 'PARKED';
  updatedAt: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export default function FleetMap({ drivers }: MapProps) {
  const [locations, setLocations] = useState<Record<string, LocationData>>({});
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Escutar Firebase (Persistência)
    const unsubscribe = onSnapshot(collection(db, 'locations'), (snapshot) => {
      const locData: Record<string, LocationData> = {};
      snapshot.forEach(doc => {
        locData[doc.id] = doc.data() as LocationData;
      });
      setLocations(prev => ({ ...locData, ...prev })); // Dá preferência ao Firebase se não houver Socket
    });

    // Escutar WebSocket (Real-time de altíssima performance)
    const connectSocket = async () => {
      try {
        const res = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'admin_123', role: 'ADMIN' })
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch token: ${res.status}`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Expected JSON response but got HTML");
        }
        
        const { token } = await res.json();

        const socket = io('/', { auth: { token } });
        
        socket.on('location_update', (data: any) => {
          setLocations(prev => ({
            ...prev,
            [data.driverId]: {
              driverId: data.driverId,
              lat: data.lat,
              lng: data.lng,
              status: 'MOVING', // Assume moving on update
              updatedAt: new Date().toISOString()
            }
          }));
        });

        return socket;
      } catch (err) {
        console.error('Socket connection error', err);
        return null;
      }
    };

    let socketInstance: any = null;
    connectSocket().then(s => { socketInstance = s; });

    return () => {
      unsubscribe();
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  // Center roughly on Brazil by default
  const center: [number, number] = [-15.793889, -47.882778];

  // Merge static driver data with real-time location data
  

  const mapMarkers = drivers.map(driver => {
    const realTimeLoc = locations[driver.id];
    let isMoving = false;

    if (realTimeLoc && realTimeLoc.updatedAt) {
      const lastUpdate = new Date(realTimeLoc.updatedAt).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastUpdate) / 1000 / 60;
      isMoving = diffMinutes <= 10 && realTimeLoc.status === 'MOVING';
    } else {
      isMoving = driver.status === 'MOVING';
    }

    return {
      ...driver,
      lat: realTimeLoc?.lat ?? driver.lat,
      lng: realTimeLoc?.lng ?? driver.lng,
      status: isMoving ? 'MOVING' : 'PARKED',
      updatedAt: realTimeLoc?.updatedAt
    };
  }).filter(d => d.lat !== undefined && d.lng !== undefined);

  return (
    <div className="w-full h-full flex flex-col md:flex-row z-0 relative bg-white">
      {/* Sidebar with Drivers */}
      <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-1/3 md:h-full z-10 relative shadow-sm shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Motoristas no Mapa</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mapMarkers.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              Nenhum motorista com localização registrada no momento.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {mapMarkers.map(driver => (
                <li 
                  key={driver.id} 
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group flex items-start justify-between"
                  onClick={() => setSelectedCenter([driver.lat!, driver.lng!])}
                >
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{driver.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{driver.vehiclePlateHorse}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${driver.status === 'MOVING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                    <button className="text-slate-400 group-hover:text-indigo-500" title="Centralizar">
                      <Navigation size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-0 z-0">
        <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="w-full h-full z-0">
          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          
          {selectedCenter && <ChangeView center={selectedCenter} />}

          {mapMarkers.map((driver) => (
            <Marker 
              key={driver.id} 
              position={[driver.lat!, driver.lng!]}
              icon={createDriverIcon(driver.status as 'MOVING' | 'PARKED')}
            >
              <Popup className="rounded-lg">
                <div className="p-1">
                  <div className="font-bold text-slate-800 mb-1">{driver.name}</div>
                  <div className="text-sm text-slate-600 mb-2">Placa: {driver.vehiclePlateHorse}</div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${driver.status === 'MOVING' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-slate-700">
                      {driver.status === 'MOVING' ? 'Em Movimento' : 'Parado'}
                    </span>
                  </div>
                  {driver.updatedAt && (
                    <div className="text-[10px] text-slate-400 mt-2">
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
