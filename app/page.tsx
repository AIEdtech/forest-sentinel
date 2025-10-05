'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SearchEngine from '@/components/SearchEngine';
import RiskDashboard from '@/components/RiskDashboard';
import AlertPanel from '@/components/AlertPanel';
import PredictionChart from '@/components/PredictionChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Toaster } from 'react-hot-toast';
import { Activity, Satellite } from 'lucide-react';

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <Card className="h-[600px] flex items-center justify-center glass">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">🗺️</div>
          </div>
        </div>
        <p className="text-gray-600 font-medium">Loading interactive map...</p>
      </div>
    </Card>
  )
});

// Prepopulated locations for quick testing
const QUICK_LOCATIONS = [
  { 
    name: '🔥 Palisades Fire (LA 2025)', 
    coords: { lat: 34.0459, lon: -118.5275 },
    active: true,
    severity: 'EXTREME'
  },
  { 
    name: '🔥 Eaton Fire (Altadena 2025)', 
    coords: { lat: 34.1901, lon: -118.1310 },
    active: true,
    severity: 'EXTREME'
  },
  { 
    name: '🏔️ Paradise, CA (Camp Fire)', 
    coords: { lat: 39.7596, lon: -121.6219 },
    active: false,
    severity: 'MODERATE'
  },
  { 
    name: '🌳 Amazon Rainforest', 
    coords: { lat: -3.4653, lon: -62.2159 },
    active: false,
    severity: 'HIGH'
  },
  { 
    name: '🌍 Congo Basin', 
    coords: { lat: -0.7264, lon: 23.6562 },
    active: false,
    severity: 'MODERATE'
  },
  {
    name: '🇦🇺 Australian Bushfire Zone',
    coords: { lat: -33.8688, lon: 151.2093 },
    active: false,
    severity: 'HIGH'
  }
];

export default function HomePage() {
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Show error message to user
        const errorMessage = data.message || data.error || 'Failed to fetch data';
        console.error('API Error:', errorMessage);
        setSearchResult({
          success: false,
          error: errorMessage,
          details: data.details
        });
        return;
      }

      setSearchResult(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult({
        success: false,
        error: 'Network error: Unable to reach the server',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLocation = (location: typeof QUICK_LOCATIONS[0]) => {
    handleSearch(`${location.coords.lat}, ${location.coords.lon}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Toaster position="top-right" toastOptions={{
        className: 'glass',
        duration: 3000,
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative p-2 bg-gradient-bg-green rounded-xl shadow-lg">
                <Satellite className="w-7 h-7 text-white" />
                <Activity className="w-4 h-4 text-yellow-300 absolute -bottom-1 -right-1 animate-pulse drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Forest Sentinel
                </h1>
                <p className="text-sm text-gray-600 font-medium">Real-time satellite forest monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="container mx-auto px-4 py-10 relative z-10">
        <Card className="p-10 glass shadow-2xl border border-white/30 card-hover overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="text-center mb-8 slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                Monitor Any Forest on <span className="gradient-text">Earth</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powered by <span className="font-semibold text-green-700">Sentinel-1 SAR</span>, <span className="font-semibold text-blue-700">MODIS</span>, and <span className="font-semibold text-orange-700">NASA FIRMS</span> real-time data
              </p>
            </div>

            <SearchEngine onSearch={handleSearch} />

            {/* Quick Location Buttons */}
            <div className="mt-10">
              <p className="text-sm text-gray-700 mb-4 text-center font-semibold flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-gradient-bg-green rounded-full animate-pulse"></span>
                Quick Access - Active Fires & High-Risk Areas
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {QUICK_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleQuickLocation(loc)}
                    className={`
                      group relative px-4 py-4 rounded-xl text-sm font-semibold
                      transition-all duration-300 transform hover:scale-105
                      shadow-md hover:shadow-xl overflow-hidden
                      ${loc.active
                        ? 'gradient-bg-red text-white'
                        : loc.severity === 'HIGH'
                        ? 'gradient-bg-orange text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
                      }
                    `}
                  >
                    {loc.active && (
                      <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300"></span>
                      </span>
                    )}
                    <div className="relative z-10">{loc.name}</div>
                    {loc.active && (
                      <div className="text-xs mt-1 font-normal opacity-90">ACTIVE NOW</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Results Section */}
      {searchResult && (
        <section className="container mx-auto px-4 pb-12 relative z-10">
          {/* Error Display */}
          {searchResult.success === false && (
            <Card className="p-8 glass border-red-300 border-2 mb-6">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-red-600 mb-3">
                  {searchResult.error || 'Service Unavailable'}
                </h3>
                <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
                  {searchResult.details || 'Unable to fetch satellite data. Please check your API configuration.'}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-left max-w-2xl mx-auto">
                  <p className="text-sm text-gray-600 font-mono">
                    If you're running in production mode, ensure all required API keys are configured in your Vercel Dashboard:
                  </p>
                  <ul className="text-sm text-gray-600 font-mono mt-2 space-y-1">
                    <li>• EE_PRIVATE_KEY (Google Earth Engine)</li>
                    <li>• NASA_FIRMS_MAP_KEY (NASA Fire Data)</li>
                    <li>• OPENWEATHER_API_KEY (Weather Data)</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Success Results */}
          {searchResult.success !== false && (
          <Tabs defaultValue="dashboard" className="space-y-6 scale-in">
            <TabsList className="glass p-2 rounded-2xl shadow-xl border border-white/30 flex flex-wrap gap-2">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:gradient-bg-green data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                📊 Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:gradient-bg-blue data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                🗺️ Map View
              </TabsTrigger>
              <TabsTrigger
                value="prediction"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                📈 7-Day Forecast
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="data-[state=active]:gradient-bg-red data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative"
              >
                ⚠️ Alerts
                {searchResult.alerts?.length > 0 && (
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full text-xs">
                    {searchResult.alerts.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-700 data-[state=active]:to-gray-900 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                📡 Raw Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="animate-in fade-in-50">
              <RiskDashboard data={searchResult} />
            </TabsContent>

            <TabsContent value="map" className="animate-in fade-in-50">
              <MapView 
                location={searchResult.location}
                fires={searchResult.fires}
                riskZones={searchResult.riskZones}
              />
            </TabsContent>

            <TabsContent value="prediction" className="animate-in fade-in-50">
              <PredictionChart forecast={searchResult.forecast} />
            </TabsContent>

            <TabsContent value="alerts" className="animate-in fade-in-50">
              <AlertPanel 
                alerts={searchResult.alerts} 
                location={searchResult.location} 
              />
            </TabsContent>

            <TabsContent value="data" className="animate-in fade-in-50">
              <Card className="p-6 bg-black/90 text-green-400">
                <pre className="text-xs overflow-auto font-mono">
                  {JSON.stringify(searchResult.satelliteData, null, 2)}
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </section>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl flex items-center justify-center z-50">
          <Card className="p-12 glass-dark shadow-2xl border-2 border-white/20 scale-in">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-24 h-24">
                {/* Orbiting satellites */}
                <div className="absolute inset-0 animate-spin-slow">
                  <Satellite className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-green-400" />
                </div>
                <div className="absolute inset-0 animate-spin-slow animation-delay-1000" style={{animationDirection: 'reverse'}}>
                  <Satellite className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 text-blue-400" />
                </div>
                <div className="absolute inset-0 animate-spin-slow animation-delay-500">
                  <Satellite className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                </div>
                {/* Center earth/forest icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                    <div className="relative text-4xl animate-pulse">🌲</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-3">Analyzing Satellite Data</p>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm">
                    Fetching Sentinel-1 SAR, MODIS, and FIRMS data...
                  </p>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  <div className="h-1.5 w-16 bg-green-600/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-bg-green shimmer"></div>
                  </div>
                  <div className="h-1.5 w-16 bg-blue-600/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-bg-blue shimmer animation-delay-300"></div>
                  </div>
                  <div className="h-1.5 w-16 bg-orange-600/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-bg-orange shimmer animation-delay-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-20 glass-dark border-t border-white/10">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 gradient-bg-green rounded-xl">
                <Satellite className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Forest Sentinel</h3>
            </div>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Powered by <span className="text-green-400">ESA Sentinel-1</span>, <span className="text-blue-400">NASA MODIS</span>, <span className="text-orange-400">FIRMS</span>, and <span className="text-purple-400">Google Earth Engine</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}