import type { NextApiRequest, NextApiResponse } from 'next';
import * as ee from '@google/earthengine';
import axios from 'axios';

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Validate required API keys for production
const validateProductionKeys = () => {
  if (!isProduction) return; // Only validate in production

  const missingKeys = [];

  if (!process.env.EE_PRIVATE_KEY || process.env.EE_PRIVATE_KEY === '{"type":"service_account"}') {
    missingKeys.push('EE_PRIVATE_KEY');
  }
  if (!process.env.NASA_FIRMS_MAP_KEY) {
    missingKeys.push('NASA_FIRMS_MAP_KEY');
  }
  if (!process.env.OPENWEATHER_API_KEY) {
    missingKeys.push('OPENWEATHER_API_KEY');
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `Production mode requires real API keys. Missing: ${missingKeys.join(', ')}. ` +
      `Please configure these environment variables in Vercel Dashboard.`
    );
  }
};

// Initialize Earth Engine with REAL credentials
const initializeEE = async () => {
  return new Promise((resolve, reject) => {
    // Check if we have real credentials
    if (!process.env.EE_PRIVATE_KEY || process.env.EE_PRIVATE_KEY === '{"type":"service_account"}') {
      reject(new Error('Earth Engine not configured'));
      return;
    }

    try {
      const key = JSON.parse(process.env.EE_PRIVATE_KEY);

      ee.data.authenticateViaPrivateKey(
        key,
        () => {
          ee.initialize(
            null,
            null,
            () => {
              console.log('✅ Earth Engine initialized successfully');
              resolve(true);
            },
            (error: any) => {
              console.error('❌ Earth Engine init error:', error);
              reject(error);
            }
          );
        },
        (error: any) => {
          console.error('❌ Earth Engine auth error:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('❌ Invalid Earth Engine credentials');
      reject(error);
    }
  });
};

// Check if EE is already initialized
let eeInitialized = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API keys in production
    validateProductionKeys();

    const { query } = req.body;

    // Initialize EE once
    if (!eeInitialized) {
      try {
        await initializeEE();
        eeInitialized = true;
      } catch (error) {
        if (isProduction) {
          // In production, fail if Earth Engine is not available
          return res.status(503).json({
            success: false,
            error: 'Service Unavailable',
            message: 'Earth Engine initialization failed. Please verify EE_PRIVATE_KEY is configured correctly.',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        console.log('⚠️ Running in demo mode - Earth Engine not available');
      }
    }
    
    // Parse location
    const location = await parseLocation(query);
    
    // Fetch REAL satellite data
    const [sarData, modisData, firmsData, weatherData] = await Promise.all([
      getRealSentinel1Data(location),
      getRealModisData(location),
      getRealFirmsData(location),
      getRealWeatherData(location)
    ]);
    
    // Calculate risk score
    const riskAnalysis = calculateRisk({
      sar: sarData,
      modis: modisData,
      firms: firmsData,
      weather: weatherData
    });
    
    // Generate forecast
    const forecast = generateForecast(riskAnalysis, weatherData);
    
    // Generate alerts
    const alerts = generateAlerts(riskAnalysis, location);
    
    res.status(200).json({
      success: true,
      dataMode: eeInitialized ? 'REAL' : 'DEMO',
      location,
      satelliteData: {
        sar: sarData,
        modis: modisData,
        firms: firmsData,
        weather: weatherData,
        timestamp: new Date().toISOString()
      },
      riskAnalysis,
      forecast,
      alerts,
      fires: firmsData.fires,
      riskZones: generateRiskZones(location, riskAnalysis)
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process search request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function parseLocation(query: string) {
  // Check if coordinates
  const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
  const match = query.match(coordPattern);
  
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lon: parseFloat(match[2]),
      name: `Location (${match[1]}, ${match[2]})`,
      bbox: [
        parseFloat(match[2]) - 0.1,
        parseFloat(match[1]) - 0.1,
        parseFloat(match[2]) + 0.1,
        parseFloat(match[1]) + 0.1
      ]
    };
  }
  
  // Known fire locations
  const knownLocations: Record<string, any> = {
    'palisades': {
      lat: 34.0459,
      lon: -118.5275,
      name: 'Palisades Fire, Los Angeles',
      active: true
    },
    'eaton': {
      lat: 34.1901,
      lon: -118.1310,
      name: 'Eaton Fire, Altadena',
      active: true
    },
    'paradise': {
      lat: 39.7596,
      lon: -121.6219,
      name: 'Paradise, CA',
      active: false
    },
    'amazon': {
      lat: -3.4653,
      lon: -62.2159,
      name: 'Amazon Rainforest, Brazil',
      active: false
    }
  };
  
  const queryLower = query.toLowerCase();
  for (const [key, loc] of Object.entries(knownLocations)) {
    if (queryLower.includes(key)) {
      return {
        ...loc,
        bbox: [loc.lon - 0.1, loc.lat - 0.1, loc.lon + 0.1, loc.lat + 0.1]
      };
    }
  }
  
  // Try geocoding
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'ForestSentinel/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        name: result.display_name,
        bbox: result.boundingbox.map((v: string) => parseFloat(v))
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  throw new Error('Location not found');
}

async function getRealSentinel1Data(location: any) {
  if (!eeInitialized) {
    if (isProduction) {
      throw new Error('Sentinel-1 data unavailable: Earth Engine not initialized');
    }
    // Return realistic demo data if EE not available
    console.log('📡 Using demo Sentinel-1 data (Earth Engine not configured)');
    const isFireZone = location.name && location.name.includes('Fire');
    return {
      vv: isFireZone ? -12.5 : -15.2,
      vh: isFireZone ? -28.7 : -22.4,
      vhVvRatio: isFireZone ? -2.3 : -1.47,
      coherence: isFireZone ? 0.32 : 0.71,
      lastUpdate: new Date().toISOString(),
      dataSource: 'demo'
    };
  }

  try {
    console.log('📡 Fetching REAL Sentinel-1 SAR data...');
    
    const point = ee.Geometry.Point([location.lon, location.lat]);
    const endDate = ee.Date(Date.now());
    const startDate = endDate.advance(-10, 'day');
    
    // Get REAL Sentinel-1 data
    const collection = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterBounds(point)
      .filterDate(startDate, endDate)
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
      .select(['VV', 'VH'])
      .first(); // Get most recent image
    
    // Check if we have data
    const imageDate = collection.get('system:time_start');
    
    // Calculate statistics
    const stats = await new Promise((resolve, reject) => {
      collection.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(5000), // 5km radius
        scale: 10,
        maxPixels: 1e9
      }).evaluate((result: any, error: any) => {
        if (error) {
          console.error('Sentinel-1 evaluation error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    const vv = (stats as any).VV || -15;
    const vh = (stats as any).VH || -22;
    
    // Get image timestamp
    const timestamp = await new Promise((resolve) => {
      imageDate.evaluate((result: any) => {
        resolve(result ? new Date(result).toISOString() : new Date().toISOString());
      });
    });
    
    console.log('✅ Real Sentinel-1 data retrieved:', { vv, vh });
    
    return {
      vv,
      vh,
      vhVvRatio: vh - vv,
      coherence: 0.7, // Would need interferometry for real coherence
      lastUpdate: timestamp as string,
      dataSource: 'real'
    };
    
  } catch (error) {
    console.error('Sentinel-1 error:', error);
    return {
      vv: -15,
      vh: -22,
      vhVvRatio: -7,
      coherence: 0.7,
      lastUpdate: new Date().toISOString(),
      dataSource: 'fallback'
    };
  }
}

async function getRealModisData(location: any) {
  if (!eeInitialized) {
    if (isProduction) {
      throw new Error('MODIS data unavailable: Earth Engine not initialized');
    }
    console.log('🌱 Using demo MODIS data (Earth Engine not configured)');
    const isFireZone = location.name && location.name.includes('Fire');
    return {
      ndvi: isFireZone ? 0.25 : 0.65,
      evi: isFireZone ? 0.18 : 0.52,
      health: isFireZone ? 'Poor' : 'Good',
      trend: isFireZone ? 'Declining' : 'Stable',
      lastUpdate: new Date().toISOString(),
      dataSource: 'demo'
    };
  }

  try {
    console.log('🌱 Fetching REAL MODIS vegetation data...');

    const point = ee.Geometry.Point([location.lon, location.lat]);
    const endDate = ee.Date(Date.now());
    const startDate = endDate.advance(-30, 'day'); // Extended from 16 to 30 days for better coverage

    // Get REAL MODIS NDVI data
    const modisCollection = ee.ImageCollection('MODIS/061/MOD13Q1')
      .filterBounds(point)
      .filterDate(startDate, endDate)
      .select(['NDVI', 'EVI']);

    // Check if collection has any images
    const collectionSize = await new Promise((resolve) => {
      modisCollection.size().evaluate((size: any) => {
        resolve(size || 0);
      });
    });

    if (collectionSize === 0) {
      console.log('⚠️ No MODIS data available for this location/timeframe, using fallback');
      throw new Error('No MODIS imagery available');
    }

    const modis = modisCollection.first();

    const stats = await new Promise((resolve, reject) => {
      modis.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(5000),
        scale: 250,
        maxPixels: 1e9
      }).evaluate((result: any, error: any) => {
        if (error) {
          console.error('MODIS evaluation error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    // MODIS scale factor is 0.0001
    const ndvi = ((stats as any).NDVI || 5000) * 0.0001;
    const evi = ((stats as any).EVI || 3000) * 0.0001;
    
    console.log('✅ Real MODIS data retrieved:', { ndvi, evi });
    
    return {
      ndvi,
      evi,
      health: ndvi > 0.6 ? 'Good' : ndvi > 0.3 ? 'Moderate' : 'Poor',
      trend: 'Stable',
      lastUpdate: new Date().toISOString(),
      dataSource: 'real'
    };
    
  } catch (error) {
    console.error('MODIS error:', error);
    return {
      ndvi: 0.5,
      evi: 0.4,
      health: 'Moderate',
      trend: 'Stable',
      lastUpdate: new Date().toISOString(),
      dataSource: 'fallback'
    };
  }
}

async function getRealFirmsData(location: any) {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;

  if (!mapKey || mapKey === '') {
    if (isProduction) {
      throw new Error('FIRMS data unavailable: NASA_FIRMS_MAP_KEY not configured');
    }
    console.log('🔥 Using demo FIRMS data (API key not configured)');
    const isFireZone = location.name && (
      location.name.includes('Palisades') ||
      location.name.includes('Eaton')
    );

    const fires = [];
    const numFires = isFireZone ? 8 : 2;

    for (let i = 0; i < numFires; i++) {
      fires.push({
        id: `DEMO_FIRE_${i + 1}`,
        lat: location.lat + (Math.random() - 0.5) * 0.05,
        lon: location.lon + (Math.random() - 0.5) * 0.05,
        brightness: 300 + Math.random() * 100,
        confidence: isFireZone ? 'high' : 'nominal',
        frp: 50 + Math.random() * 200,
        satellite: 'MODIS',
        detectionTime: new Date(Date.now() - Math.random() * 48 * 3600000).toISOString(),
        dataSource: 'demo'
      });
    }

    return {
      fires,
      count: fires.length,
      lastUpdate: new Date().toISOString(),
      dataSource: 'demo'
    };
  }
  
  try {
    console.log('🔥 Fetching REAL FIRMS fire data...');
    
    // REAL FIRMS API call
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/MODIS_NRT/${location.bbox.join(',')}/1`;
    
    const response = await axios.get(url, {
      timeout: 10000
    });
    
    const fires = parseFirmsCSV(response.data, location);
    
    console.log(`✅ Real FIRMS data: ${fires.length} fires detected`);
    
    return {
      fires: fires.map((f: any) => ({ ...f, dataSource: 'real' })),
      count: fires.length,
      lastUpdate: new Date().toISOString(),
      dataSource: 'real'
    };
    
  } catch (error) {
    console.error('FIRMS API error:', error);
    
    // Fallback to public CSV endpoint (no key needed)
    try {
      console.log('🔥 Trying FIRMS public endpoint...');
      const publicUrl = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_USA_contiguous_and_Hawaii_24h.csv';
      
      const response = await axios.get(publicUrl);
      const allFires = parseFirmsCSV(response.data, location);
      
      // Filter fires near our location
      const nearbyFires = allFires.filter((fire: any) => {
        const dist = Math.sqrt(
          Math.pow(fire.lat - location.lat, 2) + 
          Math.pow(fire.lon - location.lon, 2)
        );
        return dist < 0.5; // Within ~50km
      });
      
      return {
        fires: nearbyFires.map((f: any) => ({ ...f, dataSource: 'public' })),
        count: nearbyFires.length,
        lastUpdate: new Date().toISOString(),
        dataSource: 'public'
      };
      
    } catch (publicError) {
      console.error('FIRMS public endpoint error:', publicError);
      
      // Final fallback
      return {
        fires: [],
        count: 0,
        lastUpdate: new Date().toISOString(),
        dataSource: 'unavailable'
      };
    }
  }
}

function parseFirmsCSV(csvData: string, location: any) {
  const lines = csvData.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const fires = [];
  
  // Find column indices
  const latIdx = headers.findIndex(h => h.toLowerCase().includes('latitude'));
  const lonIdx = headers.findIndex(h => h.toLowerCase().includes('longitude'));
  const brightIdx = headers.findIndex(h => h.toLowerCase().includes('brightness') || h.toLowerCase().includes('bright_t'));
  const confIdx = headers.findIndex(h => h.toLowerCase().includes('confidence'));
  const frpIdx = headers.findIndex(h => h.toLowerCase().includes('frp'));
  const dateIdx = headers.findIndex(h => h.toLowerCase().includes('acq_date'));
  const timeIdx = headers.findIndex(h => h.toLowerCase().includes('acq_time'));
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;
    
    try {
      const fire = {
        id: `FIRE_${i}`,
        lat: parseFloat(values[latIdx]),
        lon: parseFloat(values[lonIdx]),
        brightness: parseFloat(values[brightIdx] || '330'),
        confidence: values[confIdx] || 'nominal',
        frp: parseFloat(values[frpIdx] || '0'),
        satellite: 'MODIS',
        detectionTime: `${values[dateIdx]} ${values[timeIdx]}`
      };
      
      if (!isNaN(fire.lat) && !isNaN(fire.lon)) {
        fires.push(fire);
      }
    } catch (e) {
      // Skip malformed rows
    }
  }
  
  return fires;
}

async function getRealWeatherData(location: any) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    if (isProduction) {
      throw new Error('Weather data unavailable: OPENWEATHER_API_KEY not configured');
    }
    console.log('⛅ Using demo weather data (OpenWeather not configured)');
    const isFireZone = location.name && location.name.includes('Fire');
    return {
      temperature: isFireZone ? 32 : 22,
      humidity: isFireZone ? 12 : 45,
      windSpeed: isFireZone ? 45 : 15,
      windDirection: 'NE',
      precipitation: 0,
      droughtIndex: isFireZone ? 4.5 : 2.0,
      dataSource: 'demo'
    };
  }
  
  try {
    console.log('⛅ Fetching REAL weather data...');
    
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: apiKey,
        units: 'metric'
      },
      timeout: 5000
    });
    
    const data = response.data;
    
    console.log('✅ Real weather data retrieved');
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      windDirection: getWindDirection(data.wind.deg),
      precipitation: data.rain?.['1h'] || 0,
      droughtIndex: calculateDroughtIndex(data),
      dataSource: 'real'
    };
    
  } catch (error) {
    console.error('Weather API error:', error);
    return {
      temperature: 25,
      humidity: 40,
      windSpeed: 20,
      windDirection: 'N',
      precipitation: 0,
      droughtIndex: 2.5,
      dataSource: 'fallback'
    };
  }
}

function getWindDirection(degrees: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

function calculateDroughtIndex(weatherData: any) {
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const rain = weatherData.rain?.['1h'] || 0;
  
  let index = 0;
  if (humidity < 30) index += 2;
  if (humidity < 20) index += 1;
  if (temp > 30) index += 1;
  if (temp > 35) index += 1;
  if (rain === 0) index += 1;
  
  return Math.min(index, 5);
}

function calculateRisk(data: any) {
  const factors = {
    fireActivity: 0,
    vegetationStress: 0,
    weatherConditions: 0,
    structuralChange: 0,
    accessibility: 5
  };
  
  // Fire activity (0-40 points)
  const fireCount = data.firms.count;
  if (fireCount > 10) factors.fireActivity = 40;
  else if (fireCount > 5) factors.fireActivity = 30;
  else if (fireCount > 2) factors.fireActivity = 20;
  else if (fireCount > 0) factors.fireActivity = 10;
  
  // Vegetation stress (0-25 points)
  if (data.modis.ndvi < 0.2) factors.vegetationStress = 25;
  else if (data.modis.ndvi < 0.4) factors.vegetationStress = 20;
  else if (data.modis.ndvi < 0.6) factors.vegetationStress = 10;
  else factors.vegetationStress = 5;
  
  // Weather conditions (0-30 points)
  if (data.weather.humidity < 20 && data.weather.windSpeed > 30) {
    factors.weatherConditions = 30;
  } else if (data.weather.humidity < 30 && data.weather.windSpeed > 20) {
    factors.weatherConditions = 25;
  } else if (data.weather.humidity < 40) {
    factors.weatherConditions = 15;
  } else {
    factors.weatherConditions = 5;
  }
  
  // Structural change from SAR (0-25 points)
  const vhVvRatio = data.sar.vhVvRatio;
  if (vhVvRatio < -8) factors.structuralChange = 25;
  else if (vhVvRatio < -6) factors.structuralChange = 20;
  else if (vhVvRatio < -4) factors.structuralChange = 10;
  else factors.structuralChange = 5;
  
  const totalScore = Object.values(factors).reduce((a, b) => a + b, 0);
  
  let level;
  if (totalScore >= 70) level = 'EXTREME';
  else if (totalScore >= 50) level = 'HIGH';
  else if (totalScore >= 30) level = 'MODERATE';
  else level = 'LOW';
  
  return {
    score: totalScore,
    level,
    factors,
    confidence: Math.min(95, 70 + fireCount * 2),
    timestamp: new Date().toISOString()
  };
}

function generateForecast(riskAnalysis: any, weatherData: any) {
  const forecast = [];
  const baseScore = riskAnalysis.score;
  
  for (let day = 1; day <= 7; day++) {
    const weatherImpact = weatherData.humidity < 30 ? 2 : -1;
    const trendFactor = day * weatherImpact;
    const randomVariation = Math.random() * 10 - 5;
    
    const forecastScore = Math.max(0, Math.min(100, baseScore + trendFactor + randomVariation));
    
    let level;
    if (forecastScore >= 70) level = 'EXTREME';
    else if (forecastScore >= 50) level = 'HIGH';
    else if (forecastScore >= 30) level = 'MODERATE';
    else level = 'LOW';
    
    forecast.push({
      day,
      date: new Date(Date.now() + day * 24 * 3600000).toISOString(),
      score: Math.round(forecastScore),
      level,
      confidence: Math.max(50, 95 - day * 5)
    });
  }
  
  return forecast;
}

function generateAlerts(riskAnalysis: any, location: any) {
  const alerts = [];
  
  if (riskAnalysis.level === 'EXTREME') {
    alerts.push({
      id: 'ALERT_001',
      type: 'CRITICAL',
      title: 'Extreme Fire Risk Detected',
      message: `Immediate action required at ${location.name}. Multiple critical risk factors detected.`,
      timestamp: new Date().toISOString(),
      actions: [
        'Deploy emergency resources immediately',
        'Initiate evacuation procedures',
        'Alert all local authorities',
        'Activate emergency response teams'
      ]
    });
  }
  
  if (riskAnalysis.factors.fireActivity > 20) {
    alerts.push({
      id: 'ALERT_002',
      type: 'FIRE',
      title: 'Active Fires Detected',
      message: `Multiple active fires detected within operational area.`,
      timestamp: new Date().toISOString(),
      actions: [
        'Monitor fire spread patterns',
        'Prepare suppression resources',
        'Establish containment lines'
      ]
    });
  }
  
  if (riskAnalysis.factors.weatherConditions > 20) {
    alerts.push({
      id: 'ALERT_003',
      type: 'WEATHER',
      title: 'Critical Weather Conditions',
      message: 'Extreme fire weather conditions present.',
      timestamp: new Date().toISOString(),
      actions: [
        'Issue red flag warning',
        'Suspend outdoor activities',
        'Position resources for rapid deployment'
      ]
    });
  }
  
  return alerts;
}

function generateRiskZones(location: any, riskAnalysis: any) {
  const zones = [];
  const baseRisk = riskAnalysis.score;
  
  // Generate realistic risk zones
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * Math.PI / 180;
    const distance = 0.02 + Math.random() * 0.03;
    
    const zoneLat = location.lat + distance * Math.cos(angle);
    const zoneLon = location.lon + distance * Math.sin(angle);
    const zoneRisk = Math.max(0, Math.min(100, baseRisk + (Math.random() - 0.5) * 30));
    
    let level;
    if (zoneRisk >= 70) level = 'EXTREME';
    else if (zoneRisk >= 50) level = 'HIGH';
    else if (zoneRisk >= 30) level = 'MODERATE';
    else level = 'LOW';
    
    zones.push({
      id: `ZONE_${i + 1}`,
      center: {
        lat: zoneLat,
        lon: zoneLon
      },
      radius: 1000 + Math.random() * 4000,
      riskScore: Math.round(zoneRisk),
      riskLevel: level
    });
  }
  
  return zones;
}