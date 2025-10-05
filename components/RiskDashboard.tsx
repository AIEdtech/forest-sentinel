'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Flame,
  TreePine,
  Wind,
  Droplets,
  AlertTriangle,
  Satellite,
  MapPin,
  Thermometer,
  Radio
} from 'lucide-react';

interface RiskDashboardProps {
  data: any;
}

export default function RiskDashboard({ data }: RiskDashboardProps) {
  if (!data) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'EXTREME': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MODERATE': return 'text-yellow-700 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'EXTREME': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MODERATE': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Assessment */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-slate-700" />
              <CardTitle className="text-xl">Risk Assessment Summary</CardTitle>
            </div>
            <Badge className={`px-4 py-2 text-sm font-bold ${getRiskBadgeColor(data.riskAnalysis?.level || 'LOW')}`}>
              {data.riskAnalysis?.level || 'CALCULATING'} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <tbody>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700 w-1/3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900">{data.location?.name}</td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-600" />
                    Coordinates
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-mono text-sm">
                  {data.location?.lat.toFixed(4)}°, {data.location?.lon.toFixed(4)}°
                </td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Overall Risk Score
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${getRiskColor(data.riskAnalysis?.level)}`}>
                      {data.riskAnalysis?.score || 0}/100
                    </span>
                    <div className="flex-1 max-w-xs">
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            data.riskAnalysis?.level === 'EXTREME' ? 'bg-red-600' :
                            data.riskAnalysis?.level === 'HIGH' ? 'bg-orange-500' :
                            data.riskAnalysis?.level === 'MODERATE' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${data.riskAnalysis?.score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">Confidence Level</td>
                <td className="px-6 py-4 text-slate-900 font-semibold">{data.riskAnalysis?.confidence || 0}%</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Satellite Data */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Satellite className="w-6 h-6 text-blue-700" />
            <CardTitle className="text-xl">Satellite Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Data Source</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Metric</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Value</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Fire Activity */}
              <tr className="border-b hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-slate-900">NASA FIRMS</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">Active Fires</td>
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-orange-600">
                    {data.satelliteData?.firms?.count || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-xs">
                    {data.satelliteData?.firms?.dataSource || 'N/A'}
                  </Badge>
                </td>
              </tr>

              {/* Vegetation Health - NDVI */}
              <tr className="border-b hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-slate-900">MODIS</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">NDVI (Vegetation Index)</td>
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-green-600">
                    {data.satelliteData?.modis?.ndvi?.toFixed(3) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge className={`${
                    data.satelliteData?.modis?.health === 'Good' ? 'bg-green-100 text-green-800' :
                    data.satelliteData?.modis?.health === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {data.satelliteData?.modis?.health || 'N/A'}
                  </Badge>
                </td>
              </tr>

              {/* Vegetation Health - EVI */}
              <tr className="border-b hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">MODIS</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">EVI (Enhanced Vegetation Index)</td>
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-emerald-600">
                    {data.satelliteData?.modis?.evi?.toFixed(3) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-xs">
                    {data.satelliteData?.modis?.dataSource || 'N/A'}
                  </Badge>
                </td>
              </tr>

              {/* SAR - VV */}
              <tr className="border-b hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-slate-900">Sentinel-1 SAR</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">VV Polarization (dB)</td>
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-purple-600">
                    {data.satelliteData?.sar?.vv?.toFixed(2) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-xs">
                    {data.satelliteData?.sar?.dataSource || 'N/A'}
                  </Badge>
                </td>
              </tr>

              {/* SAR - VH */}
              <tr className="border-b hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-slate-900">Sentinel-1 SAR</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">VH Polarization (dB)</td>
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-purple-600">
                    {data.satelliteData?.sar?.vh?.toFixed(2) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-xs">
                    {data.satelliteData?.sar?.dataSource || 'N/A'}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Weather Data */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="flex items-center gap-3">
            <Wind className="w-6 h-6 text-blue-700" />
            <CardTitle className="text-xl">Weather Conditions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <tbody>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700 w-1/3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    Temperature
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-2xl font-bold text-slate-900">
                    {data.satelliteData?.weather?.temperature?.toFixed(1) || 0}°C
                  </span>
                </td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Humidity
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-2xl font-bold text-slate-900">
                    {data.satelliteData?.weather?.humidity || 0}%
                  </span>
                </td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-cyan-500" />
                    Wind Speed
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-2xl font-bold text-slate-900">
                    {data.satelliteData?.weather?.windSpeed?.toFixed(1) || 0} km/h
                  </span>
                  <span className="ml-2 text-sm text-slate-600">
                    ({data.satelliteData?.weather?.windDirection || 'N/A'})
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-slate-500" />
                    Precipitation
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-2xl font-bold text-slate-900">
                    {data.satelliteData?.weather?.precipitation || 0} mm
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Risk Factors Breakdown */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
            <CardTitle className="text-xl">Risk Factors Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Risk Factor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">Fire Activity</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-orange-600">
                    {data.riskAnalysis?.factors?.fireActivity || 0}/40
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-32">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${((data.riskAnalysis?.factors?.fireActivity || 0) / 40) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">Vegetation Stress</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-green-600">
                    {data.riskAnalysis?.factors?.vegetationStress || 0}/25
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-32">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${((data.riskAnalysis?.factors?.vegetationStress || 0) / 25) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">Weather Conditions</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-blue-600">
                    {data.riskAnalysis?.factors?.weatherConditions || 0}/30
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-32">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${((data.riskAnalysis?.factors?.weatherConditions || 0) / 30) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">Structural Change (SAR)</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-purple-600">
                    {data.riskAnalysis?.factors?.structuralChange || 0}/25
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-32">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${((data.riskAnalysis?.factors?.structuralChange || 0) / 25) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">Accessibility</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-slate-600">
                    {data.riskAnalysis?.factors?.accessibility || 0}/5
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-32">
                    <div
                      className="h-full bg-slate-500"
                      style={{ width: `${((data.riskAnalysis?.factors?.accessibility || 0) / 5) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
