# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Forest Sentinel is a real-time forest risk monitoring system built with Next.js 14 that integrates satellite data from NASA and ESA to detect and predict forest fires, deforestation, and ecological threats. The system uses Sentinel-1 SAR (cloud-penetrating radar), MODIS vegetation data, NASA FIRMS fire detection, and weather data to provide comprehensive risk analysis with 7-day forecasting.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
npm run deploy
```

## Environment Configuration

The application requires API keys in `.env.local`:

- `EE_PRIVATE_KEY` - Google Earth Engine service account credentials (JSON)
- `NASA_FIRMS_MAP_KEY` - NASA FIRMS API key for fire data
- `OPENWEATHER_API_KEY` - OpenWeather API for weather data
- `NASA_EARTHDATA_TOKEN` - NASA Earthdata authentication token

**Important**: The app gracefully degrades to demo mode when API keys are unavailable. All data fetching functions have fallback mechanisms.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router + Pages Router hybrid)
- **UI**: React 18, Tailwind CSS, Radix UI components, Framer Motion
- **Data Visualization**: Recharts for charts, Leaflet for maps
- **Data Fetching**: SWR for client-side, direct API calls in API routes
- **Satellite APIs**: Google Earth Engine, NASA FIRMS, OpenWeather

### Directory Structure

```
app/
  layout.tsx        # Root layout with metadata
  page.tsx          # Main dashboard page (client component)
  globals.css       # Global styles and Tailwind directives

pages/api/
  search.ts         # Core API endpoint - handles all satellite data fetching

components/
  SearchEngine.tsx      # Location search with geocoding
  RiskDashboard.tsx     # Main risk metrics display
  MapView.tsx           # Interactive Leaflet map with fire/risk overlays
  AlertPanel.tsx        # Alert notifications and actions
  PredictionChart.tsx   # 7-day forecast visualization
  ui/                   # Reusable Radix UI components (Card, Tabs, Badge, etc.)
```

### Key Architecture Patterns

**Dual-Mode Data System**: The application operates in REAL or DEMO mode depending on API availability. Each data fetching function in `pages/api/search.ts` checks for credentials and returns realistic demo data if APIs are unavailable:

- `getRealSentinel1Data()` - Sentinel-1 SAR data via Earth Engine
- `getRealModisData()` - MODIS NDVI/EVI vegetation indices
- `getRealFirmsData()` - NASA FIRMS active fire detections (tries authenticated API → public CSV → demo)
- `getRealWeatherData()` - OpenWeather current conditions

**Risk Calculation Algorithm** (`calculateRisk()` in search.ts:580):
- Fire Activity (0-40 points) - Based on FIRMS fire count
- Vegetation Stress (0-25 points) - NDVI thresholds
- Weather Conditions (0-30 points) - Humidity + wind speed combination
- Structural Change (0-25 points) - SAR VH/VV ratio analysis
- Final score determines risk level: EXTREME (≥70), HIGH (≥50), MODERATE (≥30), LOW (<30)

**Client-Server Flow**:
1. User searches location → `SearchEngine.tsx` calls `/api/search`
2. API parses location (coordinates, known fires, or geocoding via Nominatim)
3. Parallel data fetching from all satellite sources
4. Risk calculation and forecast generation
5. Return comprehensive result object to client
6. Client displays in tabbed interface (Dashboard, Map, Forecast, Alerts, Raw Data)

## Component Details

### MapView Component
Uses Leaflet with OpenStreetMap tiles (no API key required). Key features:
- Dynamic import to avoid SSR issues with Leaflet
- Custom markers for fire locations (color-coded by confidence)
- Circle overlays for risk zones (color-coded by risk level)
- Responsive clustering for dense fire areas

### PredictionChart Component
Recharts area chart showing 7-day risk forecast with:
- Confidence intervals (shaded area)
- Color gradients based on risk levels
- Responsive tooltips with detailed metrics

### Search System
Supports three input types:
1. Direct coordinates: "34.0459, -118.5275"
2. Named locations: Hardcoded fire locations (Palisades, Eaton, Paradise, Amazon)
3. Free-form text: Geocoded via OpenStreetMap Nominatim API

## Data Sources and Rate Limits

**NASA FIRMS**: Updates every 3 hours, 1-day historical data via Map Key
- Authenticated API: `/api/area/csv/{MAP_KEY}/MODIS_NRT/{bbox}/1`
- Fallback: Public 24h USA CSV (no authentication)

**Google Earth Engine**:
- Sentinel-1: 10m resolution SAR, 12-day revisit
- MODIS: 250m resolution vegetation indices, 16-day composite

**OpenStreetMap Nominatim**: Free geocoding, requires User-Agent header

## Development Notes

### Path Aliases
- `@/*` maps to project root
- `@/components/*` maps to `./components/`
- Common imports: `import Component from '@/components/Component'`

### TypeScript Configuration
- Strict mode enabled
- Module resolution: bundler (Next.js 14 requirement)
- JSX: preserve (Next.js handles transformation)

### Styling
- Tailwind CSS with custom config in `tailwind.config.js`
- Global styles in `app/globals.css`
- Radix UI components provide accessible primitives
- Framer Motion for animations (see loading overlay in page.tsx:224)

### Known Technical Considerations

1. **Leaflet SSR Issue**: MapView must be dynamically imported with `ssr: false` to prevent window/document errors during build

2. **Earth Engine Initialization**: EE authenticates once per server process. Failed auth falls back to demo mode but doesn't crash the app

3. **FIRMS CSV Parsing**: Robust parsing with try-catch around individual rows (parseFirmsCSV() in search.ts:459) to handle malformed data

4. **Coordinates Convention**: Longitude (lon) always precedes latitude (lat) in arrays for GeoJSON compatibility, but object properties use `{lat, lon}` for clarity

## Quick Locations for Testing

Prepopulated in `app/page.tsx:16-53`:
- Palisades Fire (LA 2025): Active EXTREME risk
- Eaton Fire (Altadena 2025): Active EXTREME risk
- Paradise, CA: Historical Camp Fire location
- Amazon Rainforest: Deforestation monitoring
- Congo Basin: Tropical forest monitoring
- Australian Bushfire Zone: Seasonal fire risk
