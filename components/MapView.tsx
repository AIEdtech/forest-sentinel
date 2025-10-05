'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

// Dynamic import to avoid SSR issues
const loadLeaflet = () => {
  if (typeof window !== 'undefined') {
    return require('leaflet');
  }
  return null;
};

interface MapViewProps {
  location: any;
  fires: any[];
  riskZones: any[];
}

export default function MapView({ location, fires = [], riskZones = [] }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapInstance.current) return;

    console.log('Initializing map...');
    console.log('Location:', location);
    console.log('Fires:', fires.length);
    console.log('Risk zones:', riskZones.length);

    // Load Leaflet
    const L = loadLeaflet();
    if (!L) {
      console.error('Leaflet failed to load - window is not available');
      setIsLoading(false);
      return;
    }

    console.log('Leaflet loaded successfully');

    // Fix marker icons
    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    } catch (error) {
      console.error('Failed to fix marker icons:', error);
    }

    // Initialize map
    let styleElement: HTMLStyleElement | null = null;
    try {
      const map = L.map(mapContainer.current, {
        center: [location.lat, location.lon],
        zoom: 10,
        zoomControl: false,
        preferCanvas: true
      });

      mapInstance.current = map;
      console.log('Map initialized successfully');

    // Tile layer options (all free, no API key needed!)
    const tileLayers: Record<string, any> = {
      street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        name: 'Street Map'
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri, Maxar, Earthstar Geographics',
        name: 'Satellite'
      },
      terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, © OpenTopoMap',
        name: 'Terrain'
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors, © CARTO',
        name: 'Dark Mode'
      }
    };

      // Add initial tile layer
      let currentLayer = L.tileLayer(tileLayers.street.url, {
        attribution: tileLayers.street.attribution,
        maxZoom: 19
      });

      currentLayer.on('tileerror', (error: any) => {
        console.error('Tile loading error:', error);
      });

      currentLayer.addTo(map);

    // Custom control for layer switching
    const LayerControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.style.background = 'white';
        div.style.padding = '5px';
        div.innerHTML = `
          <select id="layer-select" style="border: none; cursor: pointer;">
            <option value="street">Street</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
            <option value="dark">Dark</option>
          </select>
        `;
        
        L.DomEvent.on(div, 'change', function(e: any) {
          const selectedLayer = (e.target as HTMLSelectElement).value;
          map.removeLayer(currentLayer);
          currentLayer = L.tileLayer(tileLayers[selectedLayer].url, {
            attribution: tileLayers[selectedLayer].attribution,
            maxZoom: 19
          }).addTo(map);
        });
        
        return div;
      }
    });

    // Add controls
    new LayerControl({ position: 'topright' }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ position: 'bottomleft' }).addTo(map);

    // Add main location marker
    const mainIcon = L.divIcon({
      className: 'custom-main-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([location.lat, location.lon], { icon: mainIcon })
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; font-weight: bold;">${location.name}</h3>
          <div style="color: #666;">
            <div>📍 Lat: ${location.lat.toFixed(4)}</div>
            <div>📍 Lon: ${location.lon.toFixed(4)}</div>
            <div>📊 Analysis Center</div>
          </div>
        </div>
      `)
      .addTo(map)
      .openPopup();

    // Add fire markers
    fires.forEach((fire, idx) => {
      const fireIcon = L.divIcon({
        className: 'custom-fire-marker',
        html: `
          <div style="
            font-size: 24px;
            animation: pulse 2s infinite;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
          ">🔥</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const confidenceColor = fire.confidence === 'high' ? '#ff0000' : 
                              fire.confidence === 'nominal' ? '#ff9800' : '#ffeb3b';

      L.marker([fire.lat, fire.lon], { icon: fireIcon })
        .bindPopup(`
          <div style="min-width: 220px;">
            <h3 style="margin: 0 0 10px 0; color: #d00; font-weight: bold;">
              🔥 Fire Detection #${idx + 1}
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 4px 0;"><b>Confidence:</b></td>
                <td style="padding: 4px 0; text-align: right;">
                  <span style="
                    background: ${confidenceColor};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                  ">${fire.confidence}</span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 4px 0;"><b>Temperature:</b></td>
                <td style="padding: 4px 0; text-align: right;">${fire.brightness}K</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 4px 0;"><b>Power:</b></td>
                <td style="padding: 4px 0; text-align: right;">${fire.frp} MW</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 4px 0;"><b>Satellite:</b></td>
                <td style="padding: 4px 0; text-align: right;">${fire.satellite}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><b>Detected:</b></td>
                <td style="padding: 4px 0; text-align: right; font-size: 11px;">
                  ${new Date(fire.detectionTime).toLocaleString()}
                </td>
              </tr>
            </table>
          </div>
        `)
        .addTo(map);
    });

    // Add risk zones
    riskZones.forEach((zone) => {
      const color = zone.riskLevel === 'EXTREME' ? '#ff0000' :
                   zone.riskLevel === 'HIGH' ? '#ff9800' :
                   zone.riskLevel === 'MODERATE' ? '#ffeb3b' : 
                   '#4caf50';

      L.circle([zone.center.lat, zone.center.lon], {
        radius: zone.radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: zone.riskLevel === 'EXTREME' ? '10, 5' : undefined
      })
        .bindPopup(`
          <div style="min-width: 180px;">
            <h3 style="margin: 0 0 10px 0; font-weight: bold;">
              Risk Zone ${zone.id}
            </h3>
            <div style="
              background: ${color};
              color: white;
              padding: 8px;
              border-radius: 4px;
              text-align: center;
              margin: 10px 0;
              font-weight: bold;
            ">
              ${zone.riskLevel} RISK
            </div>
            <div style="color: #666;">
              <div>📊 Score: ${zone.riskScore}/100</div>
              <div>📏 Radius: ${(zone.radius/1000).toFixed(1)}km</div>
            </div>
          </div>
        `)
        .addTo(map);
    });

    // Add custom CSS for animations
    styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      .custom-fire-marker {
        background: none !important;
        border: none !important;
      }
      .custom-main-marker {
        background: none !important;
        border: none !important;
      }
      .leaflet-popup-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;
    document.head.appendChild(styleElement);

      setIsLoading(false);

      // Force map to resize after load
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          console.log('Map size invalidated');
        }
      }, 100);

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setIsLoading(false);
      return;
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
      if (styleElement && styleElement.parentNode) {
        styleElement.remove();
      }
    };
  }, [location, fires, riskZones]);

  return (
    <Card className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="h-[600px] w-full" style={{ minHeight: '600px' }} />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <span>Search Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span>Active Fire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full opacity-30"></div>
            <span>Extreme Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full opacity-30"></div>
            <span>High Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full opacity-30"></div>
            <span>Moderate Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full opacity-30"></div>
            <span>Low Risk Zone</span>
          </div>
        </div>
      </div>
    </Card>
  );
}