'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/components/ui';
import {
  AlertTriangle,
  Flame,
  Cloud,
  TreePine,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Phone,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AlertPanelProps {
  alerts: any[];
  location: any;
}

export default function AlertPanel({ alerts = [], location }: AlertPanelProps) {
  const [subscribedAlerts, setSubscribedAlerts] = useState<string[]>([]);
  const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5" />;
      case 'FIRE': return <Flame className="w-5 h-5" />;
      case 'WEATHER': return <Cloud className="w-5 h-5" />;
      case 'VEGETATION': return <TreePine className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'border-red-500 bg-red-50';
      case 'FIRE': return 'border-orange-500 bg-orange-50';
      case 'WEATHER': return 'border-blue-500 bg-blue-50';
      case 'VEGETATION': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'bg-red-600';
      case 'FIRE': return 'bg-orange-600';
      case 'WEATHER': return 'bg-blue-600';
      case 'VEGETATION': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const handleSubscribe = (alertId: string) => {
    if (subscribedAlerts.includes(alertId)) {
      setSubscribedAlerts(prev => prev.filter(id => id !== alertId));
      toast.success('Alert subscription removed');
    } else {
      setSubscribedAlerts(prev => [...prev, alertId]);
      toast.success('Alert subscription activated');
    }
  };

  const handleDownloadReport = () => {
    const report = {
      location,
      alerts,
      timestamp: new Date().toISOString(),
      subscribedAlerts
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forest-risk-alerts-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Alert report downloaded');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Forest Risk Alert',
      text: `Critical forest risk detected at ${location?.name}. ${alerts.length} active alerts.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const toggleExpand = (alertId: string) => {
    setExpandedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  // Emergency contacts based on location
  const getEmergencyContacts = () => {
    const isUSA = location?.name?.includes('Los Angeles') || 
                  location?.name?.includes('California') ||
                  location?.name?.includes('Paradise');
    
    if (isUSA) {
      return [
        { name: 'Emergency', number: '911', type: 'emergency' },
        { name: 'CAL FIRE', number: '1-916-653-5123', type: 'fire' },
        { name: 'Red Cross', number: '1-800-733-2767', type: 'support' }
      ];
    }
    
    return [
      { name: 'Local Emergency', number: 'Check local services', type: 'emergency' }
    ];
  };

  const emergencyContacts = getEmergencyContacts();

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">All Clear</h3>
          <p className="text-gray-600">No active alerts for this location</p>
          <p className="text-sm text-gray-500 mt-4">
            Monitoring systems are active and will alert you if conditions change
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Actions Bar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {alerts.length} Active {alerts.length === 1 ? 'Alert' : 'Alerts'}
              </Badge>
              {alerts.some(a => a.type === 'CRITICAL') && (
                <Badge className="bg-red-600 text-white animate-pulse">
                  IMMEDIATE ACTION REQUIRED
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts (if critical alerts) */}
      {alerts.some(a => a.type === 'CRITICAL') && (
        <Card className="border-2 border-red-500 shadow-xl">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {emergencyContacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all"
                >
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.number}</p>
                  </div>
                  <Phone className="w-5 h-5 text-red-600" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isExpanded = expandedAlerts.includes(alert.id);
          const isSubscribed = subscribedAlerts.includes(alert.id);
          
          return (
            <Card 
              key={alert.id} 
              className={`border-l-4 transition-all hover:shadow-xl ${getAlertColor(alert.type)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getAlertBadgeColor(alert.type)} text-white`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {alert.title}
                        {alert.type === 'CRITICAL' && (
                          <span className="animate-pulse">⚠️</span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          className={`${getAlertBadgeColor(alert.type)} text-white`}
                        >
                          {alert.type}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isSubscribed ? "default" : "outline"}
                    onClick={() => handleSubscribe(alert.id)}
                  >
                    {isSubscribed ? (
                      <>
                        <Bell className="w-4 h-4 mr-1" />
                        Subscribed
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4 mr-1" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{alert.message}</p>
                
                {alert.actions && alert.actions.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleExpand(alert.id)}
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      Recommended Actions ({alert.actions.length})
                    </button>
                    
                    {isExpanded && (
                      <ul className="mt-3 space-y-2 ml-5">
                        {alert.actions.map((action: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* Additional resources for critical alerts */}
                {alert.type === 'CRITICAL' && (
                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Additional Resources:
                    </p>
                    <div className="space-y-1">
                      <a href="https://www.fire.ca.gov/incidents" target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-1 text-sm text-red-700 hover:text-red-900">
                        <ExternalLink className="w-3 h-3" />
                        CAL FIRE Current Incidents
                      </a>
                      <a href="https://www.ready.gov/wildfires" target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-1 text-sm text-red-700 hover:text-red-900">
                        <ExternalLink className="w-3 h-3" />
                        Wildfire Preparedness Guide
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Statistics */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Alert Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['CRITICAL', 'FIRE', 'WEATHER', 'VEGETATION'].map(type => {
              const count = alerts.filter(a => a.type === type).length;
              return (
                <div key={type} className="text-center p-4 rounded-lg bg-gray-50">
                  <div className={`inline-flex p-3 rounded-full ${getAlertBadgeColor(type)} text-white mb-2`}>
                    {getAlertIcon(type)}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{type.toLowerCase()}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}