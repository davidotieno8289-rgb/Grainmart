import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MapPin, Star, Package, Phone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

// Fix for default marker icons in React-Leaflet
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

// Custom marker icon for sellers
const createSellerIcon = (verified: boolean) => {
  const color = verified ? '#2D5016' : '#C8851A';
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          style="transform: rotate(45deg);"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    className: 'seller-marker',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
};

// Custom cluster icon
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 'small';
  let dimensions = 40;
  
  if (count > 10) {
    size = 'medium';
    dimensions = 50;
  }
  if (count > 25) {
    size = 'large';
    dimensions = 60;
  }
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #2D5016 0%, #4A7C28 100%);
        width: ${dimensions}px;
        height: ${dimensions}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        font-size: ${count > 99 ? '12px' : '14px'};
        box-shadow: 0 4px 12px rgba(45, 80, 22, 0.4);
        border: 3px solid white;
      ">
        ${count}
      </div>
    `,
    className: `seller-cluster seller-cluster-${size}`,
    iconSize: [dimensions, dimensions],
    iconAnchor: [dimensions / 2, dimensions / 2],
  });
};

export interface SellerLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  productCount: number;
  verified: boolean;
  phone?: string;
  location: string;
  avatar?: string;
}

interface SellerMapProps {
  sellers: SellerLocation[];
  onSellerClick?: (seller: SellerLocation) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  showUserLocation?: boolean;
}

// Component to handle map interactions
function MapController({ 
  center, 
  selectedSeller 
}: { 
  center: [number, number]; 
  selectedSeller?: SellerLocation 
}) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedSeller) {
      map.flyTo([selectedSeller.lat, selectedSeller.lng], 14, {
        duration: 1.5,
      });
    }
  }, [selectedSeller, map]);
  
  return null;
}

// User location marker
function UserLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();
  
  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    });
  }, [map]);
  
  if (!position) return null;
  
  const userIcon = L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #4285F4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.5);
      "></div>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  
  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="text-center py-1">
          <p className="font-semibold text-dark">Your Location</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function SellerMap({
  sellers,
  onSellerClick,
  center = [-1.2921, 36.8219], // Nairobi, Kenya
  zoom = 10,
  height = '500px',
  className = '',
  showUserLocation = true,
}: SellerMapProps) {
  const [selectedSeller, setSelectedSeller] = useState<SellerLocation | undefined>();
  
  const handleMarkerClick = (seller: SellerLocation) => {
    setSelectedSeller(seller);
    onSellerClick?.(seller);
  };
  
  // Demo sellers if none provided
  const displaySellers = useMemo(() => {
    if (sellers.length > 0) return sellers;
    
    return [
      {
        id: 'demo-1',
        name: 'Kamau Farms',
        lat: -1.2864,
        lng: 36.8172,
        rating: 4.8,
        reviewCount: 156,
        productCount: 12,
        verified: true,
        phone: '+254712345678',
        location: 'Westlands, Nairobi',
      },
      {
        id: 'demo-2',
        name: 'Njeri Grains',
        lat: -1.3031,
        lng: 36.7073,
        rating: 4.5,
        reviewCount: 89,
        productCount: 8,
        verified: true,
        phone: '+254723456789',
        location: 'Karen, Nairobi',
      },
      {
        id: 'demo-3',
        name: 'Otieno Cereals',
        lat: -1.2634,
        lng: 36.8095,
        rating: 4.2,
        reviewCount: 42,
        productCount: 5,
        verified: false,
        phone: '+254734567890',
        location: 'Parklands, Nairobi',
      },
      {
        id: 'demo-4',
        name: 'Mwangi Harvest',
        lat: -1.3197,
        lng: 36.8277,
        rating: 4.9,
        reviewCount: 203,
        productCount: 15,
        verified: true,
        phone: '+254745678901',
        location: 'South B, Nairobi',
      },
      {
        id: 'demo-5',
        name: 'Wanjiku Mills',
        lat: -1.2456,
        lng: 36.8912,
        rating: 4.1,
        reviewCount: 28,
        productCount: 4,
        verified: false,
        phone: '+254756789012',
        location: 'Kasarani, Nairobi',
      },
    ];
  }, [sellers]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl overflow-hidden shadow-lg border border-border ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} selectedSeller={selectedSeller} />
        
        {showUserLocation && <UserLocationMarker />}
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          animate={true}
        >
          {displaySellers.map((seller) => (
            <Marker
              key={seller.id}
              position={[seller.lat, seller.lng]}
              icon={createSellerIcon(seller.verified)}
              eventHandlers={{
                click: () => handleMarkerClick(seller),
              }}
            >
              <Popup className="seller-popup" maxWidth={300} minWidth={250}>
                <div className="p-1">
                  <div className="flex items-start gap-3 mb-3">
                    {seller.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-pale flex items-center justify-center">
                        <span className="text-amber font-bold text-lg">
                          {seller.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-dark truncate">
                          {seller.name}
                        </h3>
                        {seller.verified && (
                          <span className="flex-shrink-0 bg-green text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{seller.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber fill-amber" />
                      <span className="font-semibold text-dark">{seller.rating}</span>
                      <span className="text-muted">({seller.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted">
                      <Package className="w-4 h-4" />
                      <span>{seller.productCount} products</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {seller.phone && (
                      <a
                        href={`tel:${seller.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-pale text-green rounded-lg text-sm font-medium hover:bg-green hover:text-white transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => onSellerClick?.(seller)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber text-white rounded-lg text-sm font-medium hover:bg-amber-light transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Shop
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </motion.div>
  );
}
