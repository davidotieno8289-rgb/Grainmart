import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom location pin icon
const locationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #C8851A;
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(200, 133, 26, 0.4);
      border: 3px solid white;
    ">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        style="transform: rotate(45deg);"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  className: 'location-picker-marker',
  iconSize: [40, 46],
  iconAnchor: [20, 46],
});

interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
  className?: string;
}

// Component to handle map click events
function MapClickHandler({ 
  onMapClick 
}: { 
  onMapClick: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to center map on position change
function CenterMapOnPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 0.5 });
  }, [position, map]);
  
  return null;
}

// Component to locate user
function LocateButton({ 
  onLocate 
}: { 
  onLocate: (lat: number, lng: number) => void 
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  
  const handleLocate = useCallback(() => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 16 }).on('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
      setLocating(false);
    }).on('locationerror', () => {
      setLocating(false);
    });
  }, [map, onLocate]);
  
  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      className="absolute top-4 right-4 z-[1000] bg-white p-2.5 rounded-lg shadow-md hover:bg-cream transition-colors disabled:opacity-50"
      title="Use my current location"
    >
      <Crosshair className={`w-5 h-5 text-dark ${locating ? 'animate-pulse' : ''}`} />
    </button>
  );
}

// Reverse geocoding using Nominatim (OpenStreetMap)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'GrainMart/1.0',
        },
      }
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// Forward geocoding search
async function searchLocation(query: string): Promise<Array<{
  lat: number;
  lng: number;
  display_name: string;
}>> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'GrainMart/1.0',
        },
      }
    );
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error('Location search failed:', error);
    return [];
  }
}

export default function LocationPicker({
  initialPosition = [-1.2921, 36.8219], // Nairobi
  onLocationSelect,
  height = '400px',
  className = '',
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [address, setAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    lat: number;
    lng: number;
    display_name: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Fetch address when position changes
  useEffect(() => {
    const fetchAddress = async () => {
      const addr = await reverseGeocode(position[0], position[1]);
      setAddress(addr);
      onLocationSelect(position[0], position[1], addr);
    };
    fetchAddress();
  }, [position, onLocationSelect]);
  
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
  }, []);
  
  const handleLocate = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
  }, []);
  
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchLocation(searchQuery);
    setSearchResults(results);
    setShowResults(true);
    setIsSearching(false);
  }, [searchQuery]);
  
  const handleSelectSearchResult = useCallback((result: { lat: number; lng: number; display_name: string }) => {
    setPosition([result.lat, result.lng]);
    setSearchQuery(result.display_name);
    setShowResults(false);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl overflow-hidden shadow-lg border border-border ${className}`}
    >
      {/* Search Bar */}
      <div className="relative bg-white p-3 border-b border-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setShowResults(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a location..."
              className="w-full pl-10 pr-10 py-2.5 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent text-dark placeholder:text-muted"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2.5 bg-amber text-white rounded-lg font-medium hover:bg-amber-light transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-border z-[1001] max-h-64 overflow-y-auto"
            >
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-cream border-b border-border last:border-0 flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-dark line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Map */}
      <div className="relative" style={{ height }}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onMapClick={handleMapClick} />
          <CenterMapOnPosition position={position} />
          <LocateButton onLocate={handleLocate} />
          
          <Marker position={position} icon={locationIcon} />
        </MapContainer>
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2 text-sm text-dark">
              <MapPin className="w-4 h-4 text-amber flex-shrink-0" />
              <span className="font-medium">Selected:</span>
              <span className="text-muted truncate flex-1">{address || 'Click on the map to select location'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
