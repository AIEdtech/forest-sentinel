'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar, AlertTriangle } from 'lucide-react';

interface PredictionChartProps {
  forecast: any[];
}

export default function PredictionChart({ forecast }: PredictionChartProps) {
  if (!forecast || forecast.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No forecast data available</p>
      </Card>
    );
  }

  const chartData = forecast.map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    fullDate: day.date,
    score: day.score,
    confidence: day.confidence,
    level: day.level,
    day: `Day ${day.day}`
  }));

  const trend = chartData[6].score - chartData[0].score;
  const avgScore = Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length);

  const getTrendIcon = () => {
    if (trend > 5) return <TrendingUp className="w-5 h-5 text-red-500" />;
    if (trend < -5) return <TrendingDown className="w-5 h-5 text-green-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendText = () => {
    if (trend > 5) return { text: 'Risk Increasing', color: 'text-red-600' };
    if (trend < -5) return { text: 'Risk Decreasing', color: 'text-green-600' };
    return { text: 'Stable Risk', color: 'text-gray-600' };
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#eab308';
    return '#22c55e';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 shadow-lg border-0">
          <div className="space-y-2">
            <p className="font-semibold">{data.day}</p>
            <p className="text-sm text-gray-600">{format(new Date(data.fullDate), 'PPP')}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.score}</span>
              <Badge style={{ backgroundColor: getRiskColor(data.score) }}>
                {data.level}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Confidence: {data.confidence}%</p>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">7-Day Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-xl font-bold ${getTrendText().color}`}>
                {getTrendText().text}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.abs(trend)} point change
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Average Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getRiskColor(avgScore) }}>
              {avgScore}
            </div>
            <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Peak Risk Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {chartData.reduce((max, d) => d.score > max.score ? d : max).day}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Score: {Math.max(...chartData.map(d => d.score))}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Lowest Risk Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {chartData.reduce((min, d) => d.score < min.score ? d : min).day}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Score: {Math.min(...chartData.map(d => d.score))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Risk Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              7-Day Risk Forecast
            </CardTitle>
            <Badge variant="outline">
              Updated: {format(new Date(), 'PPp')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Risk level zones */}
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5">
                <Label value="EXTREME" position="right" />
              </ReferenceLine>
              <ReferenceLine y={50} stroke="#f97316" strokeDasharray="5 5">
                <Label value="HIGH" position="right" />
              </ReferenceLine>
              <ReferenceLine y={30} stroke="#eab308" strokeDasharray="5 5">
                <Label value="MODERATE" position="right" />
              </ReferenceLine>
              
              <Area
                type="monotone"
                dataKey="score"
                stroke="#ef4444"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRisk)"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Daily Risk Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {chartData.map((day, index) => (
              <div
                key={index}
                className="text-center p-3 rounded-lg border-2 hover:shadow-lg transition-all"
                style={{ 
                  borderColor: getRiskColor(day.score),
                  backgroundColor: `${getRiskColor(day.score)}10`
                }}
              >
                <div className="text-xs font-semibold text-gray-600">{day.day}</div>
                <div className="text-sm text-gray-500 mt-1">{day.date}</div>
                <div 
                  className="text-2xl font-bold mt-2"
                  style={{ color: getRiskColor(day.score) }}
                >
                  {day.score}
                </div>
                <Badge
                  className="mt-2 text-xs"
                  style={{ 
                    backgroundColor: getRiskColor(day.score),
                    color: 'white'
                  }}
                >
                  {day.level}
                </Badge>
                <div className="text-xs text-gray-500 mt-2">
                  {day.confidence}% conf.
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confidence Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Prediction Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar 
                dataKey="confidence" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 text-center mt-4">
            Confidence decreases further into the future due to weather uncertainty
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Label component for reference lines
const Label = ({ value, position }: any) => (
  <text 
    x={position === 'right' ? '95%' : '5%'} 
    dy={-5} 
    fill="#666" 
    fontSize={10}
    textAnchor={position === 'right' ? 'end' : 'start'}
  >
    {value}
  </text>
);