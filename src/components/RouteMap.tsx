import { toast } from "sonner";
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Need this to fix default marker icons in leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Routing({ origin, destination, isRoundTrip, onRouteCalculated }: { origin: string; destination: string; isRoundTrip?: boolean; onRouteCalculated?: (data: { distance: number, time: number }) => void }) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  const onRouteCalculatedRef = useRef(onRouteCalculated);

  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  useEffect(() => {
    // Initialize the routing control once
    if (!routingControlRef.current) {
      const routingControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: false,
        showAlternatives: false,
        show: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        // @ts-ignore
        createMarker: function(i: number, waypoint: any, n: number) {
          return L.marker(waypoint.latLng, { draggable: false });
        }
      }).addTo(map);

      routingControl.on('routesfound', function(e: any) {
        if ((routingControl as any)._isCancelled) return;
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const summary = routes[0].summary;
          if (onRouteCalculatedRef.current) {
            onRouteCalculatedRef.current({
              distance: summary.totalDistance / 1000,
              time: summary.totalTime
            });
          }
        }
      });
      
      routingControlRef.current = routingControl;
    }
  }, [map]);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();
    
    const geocode = async (query: string) => {
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.append('format', 'json');
        url.searchParams.append('addressdetails', '1');
        url.searchParams.append('limit', '5');
        url.searchParams.append('countrycodes', 'BR');
        url.searchParams.append('q', query);

        const res = await fetch(url.toString(), {
          method: 'GET',
          signal: abortController.signal,
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });
        
        if (!res.ok) {
          console.error(`Geocode failed: ${res.status}`);
          return null;
        }
        
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          return L.latLng(lat, lon);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        console.error("Geocoding failed", err);
      }
      return null;
    };

    const calculateRoute = async () => {
      if (!origin || !destination) return;
      
      const origins = origin.split(';').map(s => s.trim()).filter(Boolean);
      const dests = destination.split(';').map(s => s.trim()).filter(Boolean);
      
      const allPointsStr = [...origins, ...dests];
      if (allPointsStr.length < 2) return;
      
      const coords = await Promise.all(allPointsStr.map(geocode));
      const validCoords = coords.filter(c => c !== null) as L.LatLng[];
      
      if (isCancelled) return;
      
      if (validCoords.length === allPointsStr.length) {
        if (routingControlRef.current) {
          (routingControlRef.current as any)._isCancelled = false;
          const waypoints = [...validCoords];
          if (isRoundTrip && waypoints.length > 0) {
            waypoints.push(waypoints[0]);
          }
          routingControlRef.current.setWaypoints(waypoints);
        }
      } else {
        toast.error("Não foi possível encontrar algumas localizações. Tente ser mais específico na busca (ex: 'São Paulo, SP').");
      }
    };

    if (origin && destination) {
      calculateRoute();
    }

    return () => {
      isCancelled = true;
      abortController.abort();
      if (routingControlRef.current) {
        (routingControlRef.current as any)._isCancelled = true;
      }
    };
  }, [origin, destination, isRoundTrip]);

  useEffect(() => {
    return () => {
      if (routingControlRef.current) {
        try {
          routingControlRef.current.getPlan().setWaypoints([]);
          map.removeControl(routingControlRef.current);
        } catch (e) {
          // ignore cleanup errors
        }
        routingControlRef.current = null;
      }
    };
  }, [map]);

  return null;
}

interface RouteMapProps {
  origin: string;
  destination: string;
  isRoundTrip?: boolean;
  onRouteCalculated?: (data: { distance: number, time: number }) => void;
}

export default function RouteMap({ origin, destination, isRoundTrip, onRouteCalculated }: RouteMapProps) {
  // Center of Brazil
  const center: [number, number] = [-15.793889, -47.882778];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={4} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Routing origin={origin} destination={destination} isRoundTrip={isRoundTrip} onRouteCalculated={onRouteCalculated} />
      </MapContainer>
    </div>
  );
}
