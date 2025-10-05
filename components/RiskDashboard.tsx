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
                <td className="px-6 py-4 text-slate-900">
                  <div className="space-y-1">
                    <div className="font-semibold">{data.location?.name}</div>
                    <div className="font-mono text-sm text-slate-600">
                      {data.location?.lat.toFixed(4)}°, {data.location?.lon.toFixed(4)}°
                    </div>
                  </div>
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getRiskColor(data.riskAnalysis?.level)}`}>
                        {data.riskAnalysis?.score || 0}/120
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
                            style={{ width: `${((data.riskAnalysis?.score || 0) / 120) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    {data.riskAnalysis?.reasoning?.overall ? (
                      <div className="text-xs text-slate-600 italic bg-purple-50 p-2 rounded border border-purple-200">
                        <strong>AI Analysis:</strong> {data.riskAnalysis.reasoning.overall}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Sum of all factors: Fire Activity (40) + Vegetation Stress (25) + Weather (30) + Structural Change (25)
                        <br />
                        Risk Levels: ≥70 EXTREME | 50-69 HIGH | 30-49 MODERATE | &lt;30 LOW
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">Confidence Level</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-slate-900 font-semibold">{data.riskAnalysis?.confidence || 0}%</div>
                    {data.riskAnalysis?.reasoning?.confidenceExplanation ? (
                      <div className="text-xs text-slate-600 italic">
                        {data.riskAnalysis.reasoning.confidenceExplanation}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Calculated as: min(95%, 70% + (fire_count × 2%))
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              {data.riskAnalysis?.analysisMethod && (
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">Analysis Method</td>
                  <td className="px-6 py-4">
                    <Badge className={`${
                      data.riskAnalysis.analysisMethod === 'llm'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {data.riskAnalysis.analysisMethod === 'llm'
                        ? '🤖 AI-Powered (Claude Sonnet 4.0)'
                        : '📊 Rule-Based Algorithm'}
                    </Badge>
                    {data.riskAnalysis.reasoning?.overall && (
                      <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                        <strong>AI Analysis:</strong> {data.riskAnalysis.reasoning.overall}
                      </div>
                    )}
                  </td>
                </tr>
              )}
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
                <td className="px-6 py-4 text-slate-700">
                  <div className="space-y-1">
                    <div>NDVI (Vegetation Index)</div>
                    <div className="text-xs text-slate-500 font-normal">
                      ≥0.6: Healthy | 0.3-0.6: Moderate | &lt;0.3: Poor
                    </div>
                  </div>
                </td>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-slate-900">Fire Activity</span>
                  </div>
                </td>
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
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <div>
                      {data.satelliteData?.firms?.count > 10 ? '10+ active fires - Active wildfire event' :
                       data.satelliteData?.firms?.count > 5 ? '6-10 fires - Major fire activity' :
                       data.satelliteData?.firms?.count > 2 ? '3-5 fires - Moderate fire activity' :
                       data.satelliteData?.firms?.count > 0 ? '1-2 fires - Isolated fires' :
                       'No active fires detected'}
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      Scoring: &gt;10 fires = 40pts | 6-10 = 30pts | 3-5 = 20pts | 1-2 = 10pts | 0 = 0pts
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-slate-900">Vegetation Stress</span>
                  </div>
                </td>
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
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <div>
                      NDVI {data.satelliteData?.modis?.ndvi?.toFixed(2)}: {
                        data.satelliteData?.modis?.ndvi < 0.2 ? 'Dead/dying vegetation - extreme fire fuel' :
                        data.satelliteData?.modis?.ndvi < 0.4 ? 'Stressed vegetation - high fire fuel' :
                        data.satelliteData?.modis?.ndvi < 0.6 ? 'Moderate health - some fire risk' :
                        'Healthy vegetation - low fire risk'
                      }
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      Scoring: NDVI &lt;0.2 = 25pts | 0.2-0.4 = 20pts | 0.4-0.6 = 10pts | ≥0.6 = 5pts
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">Weather Conditions</span>
                  </div>
                </td>
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
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <div>
                      {data.satelliteData?.weather?.humidity < 20 && data.satelliteData?.weather?.windSpeed > 30
                        ? 'Red Flag conditions - extreme fire weather' :
                       data.satelliteData?.weather?.humidity < 30 && data.satelliteData?.weather?.windSpeed > 20
                        ? 'Critical fire weather conditions' :
                       data.satelliteData?.weather?.humidity < 40
                        ? 'Elevated fire risk from dry conditions' :
                        'Normal weather conditions'}
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      Scoring: H&lt;20% + W&gt;30km/h = 30pts | H&lt;30% + W&gt;20km/h = 25pts | H&lt;40% = 15pts | Normal = 5pts
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-slate-900">Structural Change</span>
                  </div>
                </td>
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
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <div>
                      SAR VH/VV {data.satelliteData?.sar?.vhVvRatio?.toFixed(1)}dB: {
                        data.satelliteData?.sar?.vhVvRatio < -8 ? 'Major structural change - clear-cutting/severe damage' :
                        data.satelliteData?.sar?.vhVvRatio < -6 ? 'Moderate disturbance - logging/thinning detected' :
                        data.satelliteData?.sar?.vhVvRatio < -4 ? 'Minor changes - selective logging' :
                        'Intact forest structure'
                      }
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      Scoring: VH/VV &lt;-8dB = 25pts | -8 to -6dB = 20pts | -6 to -4dB = 10pts | ≥-4dB = 5pts
                    </div>
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
