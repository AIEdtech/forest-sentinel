'use client';

import { useState } from 'react';
import { Search, MapPin, Flame, TreePine, Navigation } from 'lucide-react';

interface SearchEngineProps {
  onSearch: (query: string) => void;
}

export default function SearchEngine({ onSearch }: SearchEngineProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      setSuggestions([]);
      await onSearch(query);
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Generate suggestions
    if (value.length > 2) {
      const sampleSuggestions = [
        'Palisades Fire, Los Angeles',
        'Amazon Rainforest, Brazil',
        'Paradise, California',
        'Congo Basin Forest',
        'Yellowstone National Park'
      ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(sampleSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    onSearch(suggestion);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
          setQuery(coords);
          onSearch(coords);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search location (e.g., 'Palisades Fire', '34.0459, -118.5275', 'Amazon rainforest')"
            className="w-full pl-16 pr-48 py-5 text-lg border-2 border-gray-300 rounded-2xl
                     focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100
                     transition-all duration-300 placeholder-gray-400 shadow-md
                     hover:shadow-lg group-hover:border-green-400
                     bg-white/90 backdrop-blur-sm"
            disabled={isSearching}
            autoComplete="off"
          />

          <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-green-50 rounded-full">
            <Search className="w-5 h-5 text-green-600" />
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-50
                       rounded-full transition-all duration-200"
              title="Use current location"
            >
              <Navigation className="w-5 h-5" />
            </button>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-7 py-3 gradient-bg-green btn-hover
                       text-white rounded-xl hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 flex items-center gap-2
                       shadow-lg font-semibold relative z-10"
            >
              {isSearching ? (
                <>
                  <div className="spinner h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Search suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-3 glass rounded-2xl shadow-2xl border border-white/30 overflow-hidden scale-in">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-6 py-4 text-left hover:bg-green-50/50 transition-all duration-200
                       border-b border-gray-100/50 last:border-b-0 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <MapPin className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-gray-800 font-medium">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 hover:border-green-300 transition-colors">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700 font-medium">Coordinates or location</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 hover:border-orange-300 transition-colors">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-gray-700 font-medium">Real-time fire data</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 hover:border-green-300 transition-colors">
          <TreePine className="w-4 h-4 text-green-600" />
          <span className="text-gray-700 font-medium">Forest health analysis</span>
        </div>
      </div>
    </div>
  );
}