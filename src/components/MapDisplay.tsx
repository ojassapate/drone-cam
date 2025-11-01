import React, { useEffect, useState, useRef } from 'react';
import { useDroneStream } from '@/context/DroneStreamContext';
import { formatDistance, calculateDistance } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';

// Leaflet imports - these will be loaded from CDN
declare global {
  interface Window {
    L: any;
  }
}

const MapDisplay: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoom, setZoom] = useState(15);
  const [distance, setDistance] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [droneLocation, setDroneLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const { telemetryData, connectedDevices } = useDroneStream();
  
  // Find drone device
  const droneDevice = connectedDevices.find(d => d.deviceType === 'drone' && d.isConnected);
  
  // Load Leaflet script
  useEffect(() => {
    if (mapLoaded) return;
    
    const loadLeaflet = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    };
    
    loadLeaflet();
  }, [mapLoaded]);
  
  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;
    
    try {
      // Create map
      mapInstanceRef.current = window.L.map(mapRef.current, {
        center: [51.505, -0.09], // Default center
        zoom,
        zoomControl: false // We'll add custom zoom controls
      });
      
      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Create markers but don't add them yet
      const droneIcon = window.L.divIcon({
        html: `<div class="flex items-center justify-center bg-secondary text-white rounded-full p-1" style="width:32px;height:32px">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      const userIcon = window.L.divIcon({
        html: `<div class="flex items-center justify-center bg-primary text-white rounded-full p-1" style="width:32px;height:32px">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      droneMarkerRef.current = window.L.marker([0, 0], { icon: droneIcon });
      userMarkerRef.current = window.L.marker([0, 0], { icon: userIcon });
      
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            setUserLocation(location);
            
            // Add user marker
            userMarkerRef.current.setLatLng([latitude, longitude]).addTo(mapInstanceRef.current);
            
            // Center map on user
            mapInstanceRef.current.setView([latitude, longitude], zoom);
            
            // If no drone location, use user location plus small offset for demo
            if (!droneLocation) {
              const demoLocation = { 
                lat: latitude + 0.001, 
                lng: longitude + 0.001 
              };
              setDroneLocation(demoLocation);
              droneMarkerRef.current.setLatLng([demoLocation.lat, demoLocation.lng]).addTo(mapInstanceRef.current);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            // Use default location
            const defaultLocation = { lat: 51.505, lng: -0.09 };
            setUserLocation(defaultLocation);
            
            if (userMarkerRef.current && mapInstanceRef.current) {
              userMarkerRef.current.setLatLng([defaultLocation.lat, defaultLocation.lng]).addTo(mapInstanceRef.current);
              
              // For demo purposes, create a simulated drone location near the default location
              const demoLocation = { 
                lat: defaultLocation.lat + 0.001, 
                lng: defaultLocation.lng + 0.001 
              };
              setDroneLocation(demoLocation);
              
              if (droneMarkerRef.current) {
                droneMarkerRef.current.setLatLng([demoLocation.lat, demoLocation.lng]).addTo(mapInstanceRef.current);
              }
            }
          }
        );
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      // Reset map state to allow for another attempt
      mapInstanceRef.current = null;
      setMapLoaded(false);
    }
    
  }, [mapLoaded, zoom, droneLocation]);
  
  // Update drone location from telemetry
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !droneDevice) return;
    
    const droneTelemetry = telemetryData[droneDevice.deviceId];
    if (droneTelemetry && droneTelemetry.latitude && droneTelemetry.longitude) {
      const newLocation = {
        lat: droneTelemetry.latitude,
        lng: droneTelemetry.longitude
      };
      
      setDroneLocation(newLocation);
      
      // Update drone marker
      if (droneMarkerRef.current) {
        droneMarkerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
        
        // Add to map if not already added
        if (!mapInstanceRef.current.hasLayer(droneMarkerRef.current)) {
          droneMarkerRef.current.addTo(mapInstanceRef.current);
        }
      }
    }
  }, [telemetryData, droneDevice, mapLoaded]);
  
  // Calculate distance between user and drone
  useEffect(() => {
    if (userLocation && droneLocation) {
      const dist = calculateDistance(
        userLocation.lat, userLocation.lng,
        droneLocation.lat, droneLocation.lng
      );
      setDistance(dist);
    }
  }, [userLocation, droneLocation]);
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const newZoom = Math.min(zoom + 1, 19);
      setZoom(newZoom);
      mapInstanceRef.current.setZoom(newZoom);
    }
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const newZoom = Math.max(zoom - 1, 3);
      setZoom(newZoom);
      mapInstanceRef.current.setZoom(newZoom);
    }
  };
  
  // Handle recenter
  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], zoom);
    }
  };
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md col-span-1 md:col-span-2">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        Location
      </h2>
      
      <div 
        ref={mapRef}
        className="w-full aspect-square rounded-lg overflow-hidden bg-slate-700 relative"
        aria-label="Map showing drone and user locations"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
            <div className="text-gray-200">Loading map...</div>
          </div>
        )}
        
        {/* Map controls */}
        <div className="absolute top-2 right-2 flex flex-col z-10 gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-slate-800/80 hover:bg-slate-700"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            +
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="bg-slate-800/80 hover:bg-slate-700"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            -
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="bg-slate-800/80 hover:bg-slate-700"
            onClick={handleRecenter}
            aria-label="Recenter map"
          >
            ⊕
          </Button>
        </div>
        
        {/* Distance indicator */}
        {distance !== null && (
          <div className="absolute bottom-2 left-2 bg-slate-800/80 p-2 rounded-md z-10">
            <div className="text-xs text-gray-300 mb-1">Distance</div>
            <div className="text-sm font-medium">{formatDistance(distance)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDisplay;
